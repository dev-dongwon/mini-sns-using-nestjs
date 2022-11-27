import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1613121798443 implements MigrationInterface {
  name = 'SeedDb1613121798443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags(name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );

    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$EcrIZBmtWrjEFHlUKIjmqOsTuLzoW4ZHK3jQA2Zze/DKwVJ9r85WC')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'article', 'article description', 'first article body', 'coffee,dragons',1)`,
    );
  }

  public async down(): Promise<void> {}
}
