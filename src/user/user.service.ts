import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "@app/user/dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "config";
import { UserResponseInterface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/loginUser.dto";
import { compare } from "bcrypt";
import { UpdateUserDto } from "./dto/updateUser.dto";

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

  async findById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { id }
    })
  };

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: [ "id", "username", "bio", "email", "image", "password" ]
    });

    if (!user) {
      throw new HttpException(
        "credentials are not valid",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    const isPasswordCorrect = await compare(loginUserDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        "credentials are not valid",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    delete user.password;
    return user;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
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