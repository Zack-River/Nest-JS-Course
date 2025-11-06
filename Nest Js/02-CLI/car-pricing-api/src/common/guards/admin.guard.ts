import {
  CanActivate,
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.currentUser;
    if (!user) {
      throw new ForbiddenException(
        'You must be logged in to access this resource',
      );
    }
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can access this resource');
    }
    return true;
  }
}
