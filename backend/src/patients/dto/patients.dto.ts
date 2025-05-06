import { IsString, IsOptional, IsDate, IsBoolean, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
export class CreatePatientDto {
  @IsString()
  name: string;

  @IsString()
  gender: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob?: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob?: Date;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class AddInsurancePlanDto {
  @IsString()
  planId: string;

  @IsString()
  membershipNumber: string;

  @IsBoolean()
  primaryHolder: boolean;

  @IsOptional()
  @IsString()
  relationshipToHolder?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

export class UpdateInsurancePlanDto {
  @IsOptional()
  @IsString()
  membershipNumber?: string;

  @IsOptional()
  @IsBoolean()
  primaryHolder?: boolean;

  @IsOptional()
  @IsString()
  relationshipToHolder?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'PENDING_VERIFICATION'])
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING_VERIFICATION';
}
