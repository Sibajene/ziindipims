import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class SaleItemDto {
  @IsUUID()
  batchId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateSaleDto {
  @IsUUID()
  branchId: string;

  @IsUUID()
  soldById: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsUUID()
  patientInsuranceId?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
