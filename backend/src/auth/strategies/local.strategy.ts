import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);
  
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    this.logger.log(`Validating user: ${email}`);
    
    try {
      const user = await this.authService.validateUser(email, password);
      this.logger.log(`User validated successfully: ${JSON.stringify(user)}`);
      return user;
    } catch (error) {
      this.logger.error(`User validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
