import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID, IsArray, IsEnum, IsDate, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ClaimStatus } from '@prisma/client';

export class CreateProviderDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  paymentTermDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  approvalRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  paymentTermDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsUUID()
  providerId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercentage: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLimit?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  patientCopay?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualLimit?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  patientCopay?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class AddCoverageItemDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercentage: number;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class UpdateCoverageItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

export class UpdateClaimStatusDto {
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class ClaimItemDto {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(0)
  approvedQuantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class UpdateClaimItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClaimItemDto)
  items: ClaimItemDto[];
}
