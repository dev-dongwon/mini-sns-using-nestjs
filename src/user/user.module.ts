import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { userController } from "@app/user/user.controller";
import { UserService } from "@app/user/user.service";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [userController],
  providers: [UserService, AuthGuard],
  exports: [UserService]
})

export class UserModule {}