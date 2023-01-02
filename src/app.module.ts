import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user/user.module';
import { AuthMiddleware } from './user/middlewares/auth.middleware';
import { ArticleModule } from './article/article.module';
import { ProfileModule } from './profile/profile.module';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '@app/utils/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전체적으로 사용하기 위해
      envFilePath: `.${process.env.NODE_ENV}.env`,
      // load: [config],
      validate,
    }),
    // TypeOrmModule.forRoot(ormconfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // Entity의 수정사항을 자동으로 DB에 갱신시켜줌. 이 기능이 편한건 맞지만 간혹 특정 데이터를 아예 밀어버릴 수 있기 때문에 production 레벨에서는 안전하지 않음.
        synchronize: false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    TagModule,
    UserModule,
    ArticleModule,
    ProfileModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
