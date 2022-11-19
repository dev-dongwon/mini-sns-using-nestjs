import { Body, Controller, Get, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "@app/user/user.service";
import { CreateUserDto } from "@app/user/dto/createUser.dto";
import { UserResponseInterface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/loginUser.dto";
import { ExpressRequest } from "./types/expressRequest.interface";
import { User } from "@app/user/decorators/user.decorator";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Controller()
export class userController {
  constructor(private readonly userService: UserService) {}

  @Post("users")
  @UsePipes(new ValidationPipe())
  async createUser(@Body("user") createUserDto: CreateUserDto): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post("users/login")
  @UsePipes(new ValidationPipe())
  async login(
    @Body("user") loginDto: LoginUserDto
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @Get("users")
  @UseGuards(AuthGuard)
  async currentUser(
    @Req() request: ExpressRequest,
    @User() user: UserEntity,
    ): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put("user")
  @UseGuards(AuthGuard)
  async updateCurrentUser(
    @Body("user") UpdateUserDto: UpdateUserDto,
    @User("id") currentUserId: number,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(currentUserId, UpdateUserDto);
    return this.userService.buildUserResponse(user);
  }

}