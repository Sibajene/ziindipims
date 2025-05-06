import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.log('JwtAuthGuard: canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      this.logger.warn(`JwtAuthGuard: Authentication failed. Error: ${err}, Info: ${info}`);
      throw err || new UnauthorizedException('Authentication required');
    }
    this.logger.log(`JwtAuthGuard: Authentication succeeded for user: ${user.id}`);
    return user;
  }
}
