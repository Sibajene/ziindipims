import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { User } from '../entities/user.entity';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  pharmacyId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  pharmacyId?: string;
}
// Update your UserWithoutPassword type


export type UserWithoutPassword = Omit<User, 'password'> & {
  profileImageUrl?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  theme?: string;
};