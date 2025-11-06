// src/common/interceptors/current-user.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();

    const { session } = request;
    if (!session || !session.userId) {
      return handler.handle();
    }

    const user = await this.usersService.findOne(session.userId);
    if (user) {
      request.currentUser = user;
    }

    return handler.handle();
  }
}
