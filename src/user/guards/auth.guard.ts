import { CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Observable } from "rxjs";
import { ExpressRequest } from "../types/expressRequest.interface";

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<ExpressRequest>();

    if (request.user) {
      return true;
    }

    throw new HttpException("Not authorized", HttpStatus.UNAUTHORIZED);
  }
}