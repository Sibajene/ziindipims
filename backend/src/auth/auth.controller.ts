import { Controller, Post, Body, UseGuards, Get, Request, Logger, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/user.dto';
import { LoginDto } from './dto/auth.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    this.logger.log(`Login request received: ${JSON.stringify(loginDto)}`);
    this.logger.log(`User from request: ${JSON.stringify(req.user)}`);
    
    const result = await this.authService.login(req.user);
    this.logger.log(`Login response: ${JSON.stringify(result)}`);
    
    return result;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const userId = req.user.id;
    return this.authService.updateProfile(userId, updateData);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() requestResetDto: RequestPasswordResetDto) {
    try {
      const token = await this.authService.generatePasswordResetToken(requestResetDto.email);
      
      // In a real application, you would send an email with the reset link
      // For development, we'll just return the token
      return { 
        message: 'Password reset email sent',
        // Remove this in production
        token: token 
      };
    } catch (error) {
      // Always return the same message to prevent email enumeration
      return { message: 'If your email is registered, you will receive a password reset link' };
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
    
    return { message: 'Password has been reset successfully' };
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() refreshTokenDto: RefreshTokenDto, @Request() req) {
    // Revoke the specific refresh token
    await this.authService.revokeRefreshToken(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Request() req) {
    // Revoke all refresh tokens for the user
    await this.authService.revokeAllUserTokens(req.user.id);
    return { message: 'Logged out from all devices successfully' };
  }
}
