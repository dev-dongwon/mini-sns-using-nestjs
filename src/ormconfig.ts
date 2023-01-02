import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // Entity의 수정사항을 자동으로 DB에 갱신시켜줌. 이 기능이 편한건 맞지만 간혹 특정 데이터를 아예 밀어버릴 수 있기 때문에 production 레벨에서는 안전하지 않음.
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export default config;
