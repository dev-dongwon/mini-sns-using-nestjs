import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { userController } from "@app/user/user.controller";
import { UserService } from "@app/user/user.service";

@Module({
  // imports: [TypeOrmModule.forRoot(ormconfig), TagModule, UserModule ],
  controllers: [userController],
  providers: [UserService],
})

export class UserModule {}