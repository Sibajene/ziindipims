import { Injectable, UnauthorizedException, Logger, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private subscriptionService: SubscriptionService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.log(`Validating user: ${email}`);
    
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      this.logger.warn(`User not found: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn(`User account is inactive: ${email}`);
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Remove password from returned user object
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    this.logger.log(`Logging in user: ${JSON.stringify(user)}`);

    // Fetch fresh user data including pharmacyId
    const freshUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pharmacyId: true,
        branchId: true,
      },
    });
    
    // Generate tokens
    const tokens = await this.generateTokens(freshUser);

    return {
      user: freshUser,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    };
  }

  async generateTokens(user: any) {
    // Generate access token
    const accessToken = this.jwtService.sign(
      { 
        sub: user.id, 
        email: user.email,
        role: user.role,
        name: user.name,
        pharmacyId: user.pharmacyId
      },
      { expiresIn: '15m' } // Short-lived access token
    );
    
    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { 
        sub: user.id,
        type: 'refresh'
      },
      { expiresIn: '7d' } // Longer-lived refresh token
    );
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });
    
    return {
      accessToken,
      refreshToken
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password, role, pharmacy } = registerDto;
    this.logger.log(`Attempting to register user with email: ${email}`);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: User with email ${email} already exists`);
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      this.logger.log('Password hashed successfully');

      // Create the pharmacy first
      this.logger.log(`Creating pharmacy: ${pharmacy.name}`);
      const newPharmacy = await this.prisma.pharmacy.create({
        data: {
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone || null,
          email: pharmacy.email || null,
        },
      });
      this.logger.log(`Pharmacy created with ID: ${newPharmacy.id}`);

      // Create a default branch for the pharmacy
      this.logger.log('Creating default branch');
      const newBranch = await this.prisma.branch.create({
        data: {
          name: 'Main Branch',
          location: pharmacy.address,
          phone: pharmacy.phone || null,
          email: pharmacy.email || null,
          pharmacyId: newPharmacy.id,
        },
      });
      this.logger.log(`Branch created with ID: ${newBranch.id}`);

      // Create the user with reference to the pharmacy and branch
      this.logger.log(`Creating user: ${name}`);
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          pharmacyId: newPharmacy.id,
          branchId: newBranch.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          pharmacyId: true,
          branchId: true,
        },
      });
      this.logger.log(`User created with ID: ${newUser.id}`);

      // Create free trial subscription for the new pharmacy
      try {
        await this.subscriptionService.createFreeTrialSubscription(newPharmacy.id);
        this.logger.log(`Free trial subscription created for pharmacy ID: ${newPharmacy.id}`);
      } catch (error) {
        this.logger.warn(`Failed to create free trial subscription: ${error.message}`);
      }

      return {
        message: 'Registration successful',
        user: newUser,
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`An error occurred during registration: ${error.message}`);
    }
  }

  async updateProfile(userId: number, updateData: any) {
    this.logger.log(`Updating profile for user ID: ${userId}`);
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId.toString() },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          pharmacyId: true,
          branchId: true,
        },
      });
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update profile for user ID ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    this.logger.log(`Generating password reset token for email: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      throw new NotFoundException('User not found');
    }

    // Generate a random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Store token in passwordResetToken table or user record
    // Assuming a passwordResetToken model exists in Prisma schema
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id.toString(),
        expiresAt,
      },
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string) {
    this.logger.log(`Resetting password using token: ${token}`);
    const resetTokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetTokenRecord) {
      this.logger.warn('Invalid password reset token');
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      this.logger.warn('Expired password reset token');
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await this.prisma.user.update({
        where: { id: resetTokenRecord.userId.toString() },
        data: { password: hashedPassword },
      });

      // Delete the used token
      await this.prisma.passwordResetToken.delete({
        where: { token },
      });

      this.logger.log(`Password reset successful for user ID: ${resetTokenRecord.userId}`);
    } catch (error) {
      this.logger.error(`Failed to reset password: ${error.message}`);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async refreshAccessToken(refreshToken: string) {
    this.logger.log('Refreshing access token');
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      this.logger.warn('Invalid refresh token');
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      this.logger.warn('Expired refresh token');
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = tokenRecord.user;

    // Generate new access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
        pharmacyId: user.pharmacyId,
      },
      { expiresIn: '15m' }
    );

    return { access_token: accessToken };
  }

  async revokeRefreshToken(refreshToken: string) {
    this.logger.log('Revoking refresh token');
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      this.logger.log('Refresh token revoked successfully');
    } catch (error) {
      this.logger.error(`Failed to revoke refresh token: ${error.message}`);
      throw new InternalServerErrorException('Failed to revoke refresh token');
    }
  }

  async revokeAllUserTokens(userId: number) {
    this.logger.log(`Revoking all refresh tokens for user ID: ${userId}`);
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: userId.toString() },
      });
      this.logger.log('All refresh tokens revoked successfully');
    } catch (error) {
      this.logger.error(`Failed to revoke all tokens for user ID ${userId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to revoke all user tokens');
    }
  }
}
