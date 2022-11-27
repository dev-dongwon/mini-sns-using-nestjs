import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, DeleteResult, Repository } from "typeorm";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { UserEntity } from "@app/user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  
    private dataSource: DataSource
  ) {}

  async findAll(currentUserId: number, query): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource.getRepository(ArticleEntity)
    .createQueryBuilder(
      "articles", 
    ).leftJoinAndSelect("articles.author", "author");

    if (query.tag) {
      queryBuilder.andWhere("articles.tagList LIKE :tag", {
        tag: `%${query.tag}`
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({ where: {
        username: query.author,
      }});
  
      queryBuilder.andWhere("articles.authorId = :id", {
        id: author.id,
      });
    }

    if (query.favorited) {
      // favorite한 user를 우선 찾고
      const user = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ["favorites"]
      })

      if (!user) {
        // 유저가 없을때는 에러를 던져줘서 프론트가 어떻게 보여줄 지 판단하게 하는게 맞나? 나라면 에러를 던진다
        throw new HttpException("not exist user", HttpStatus.NOT_FOUND)
      }

      const ids = user.favorites.map((r) => r.id);
      
      // favorite한 article이 있으면 
      if (ids.length > 0) {
        // articles에서 해당 article을 찾고
        queryBuilder.andWhere("articles.id IN (:...ids)", { ids })
      } else {
        // 아니면 걍 빈 array 리턴.
        // set always false, return empty array
        queryBuilder.andWhere("1=0")
      }

      console.log("author", user);
    }

    queryBuilder.orderBy("articles.createdAt", "DESC");
    const articlesCount = await queryBuilder.getCount();

    
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoritesId = new Set<number>();

    if (currentUserId) {
      const user = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ["favorites"]
      });

      user.favorites.map((r) => favoritesId.add(r.id));
    }

    const articles = await queryBuilder.getMany();
    const articleWithFavorite = articles.map((r) => {
      if (favoritesId.has(r.id)) {
        return { ...r, favorited: true}
      }

      return { ...r, favorited: false}
    })

    return {
      articles: articleWithFavorite,
      articlesCount
    }
  }

  async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOneBy({ slug });
  }

  async addArticleToFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favorites"]
    })

    const isNotFavorites = user.favorites.findIndex(articleInFavorite => articleInFavorite.id === article.id) === -1;

    if (isNotFavorites) {
      user.favorites.push(article);
      article.favoritesCount++;

      await Promise.all([
        this.userRepository.save(user),
        this.articleRepository.save(article)
      ])
    }

    return article;
  }

  async deleteArticleToFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ["favorites"]
    })

    const articleIndex = user.favorites.findIndex(articleInFavorite => articleInFavorite.id === article.id);

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;

      await Promise.all([
        this.userRepository.save(user),
        this.articleRepository.save(article)
      ])
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return {
      article
    }
  }

  async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    
    if (!article) {
      throw new HttpException("Article is not found", HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException("Not Author", HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug })
  }

  async updateArticle(slug: string, updateArticleDto: CreateArticleDto, currentUserId: number): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException("Article is not found", HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException("Not Author", HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  private getSlug(title: string): string {
    return slugify(title, {
      lower: true
    }) + "-" + ((Math.random() * Math.pow(36,6)) | 0).toString(36);
  }
}