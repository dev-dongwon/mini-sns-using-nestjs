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

    queryBuilder.orderBy("articles.createdAt", "DESC");
    const articlesCount = await queryBuilder.getCount();

    
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return {
      articles,
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