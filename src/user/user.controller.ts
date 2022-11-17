import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "@app/user/user.service";
import { CreateUserDto } from "@app/user/dto/createUser.dto";

@Controller()
export class userController {
  constructor(private readonly userService: UserService) {}

  @Post("users")
  async createUser(@Body("user") createUserDto: CreateUserDto  ): Promise<any> {
    return await this.userService.createUser(createUserDto); 
  }

}