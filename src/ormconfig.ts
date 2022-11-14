import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const config: PostgresConnectionOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "sns",
  password: "123",
  database: "sns",
  entities: [__dirname + "/**/*.entity{.ts, .js}"],
  // object랑 싱크 맞춰서 자동으로 테이블 만들어줌. 편하네!
  synchronize: true,
}

export default config;