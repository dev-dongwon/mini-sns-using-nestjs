import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "@app/user/dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "config";
import { UserResponseInterface } from "./types/userResponse.interface";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}
  
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    const userByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        "Email or username are duplicated",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    return await this.userRepository.save(newUser); 
  }

  generateJwt(user: UserEntity): string {
    return sign({
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET)
  }

  buildUserResponse(user: UserEntity): UserResponseInterface {
    console.log(this.generateJwt(user));
    return {
      user: {
        ...user,
        token: this.generateJwt(user)
      }
    }
  }
}