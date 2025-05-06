import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  planId?: string;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  trialEndsAt?: string;

  @IsDateString()
  @IsOptional()
  canceledAt?: string;

  @IsDateString()
  @IsOptional()
  currentPeriodStart?: string;

  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsString()
  @IsOptional()
  paymentProvider?: string;

  @IsString()
  @IsOptional()
  paymentProviderId?: string;
}
