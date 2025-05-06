import { IsString, IsNumber, IsOptional, IsUUID, IsArray, IsDate, Min, ValidateNested }from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { PrescriptionStatus } from '@prisma/client';

export class DispenseItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(1)
  quantityToDispense: number;

  @IsString()
  @IsOptional()
  batchId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class DispensePrescriptionItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispenseItemDto)
  items: DispenseItemDto[];
} 

export class PrescriptionItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  dosage: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsUUID()
  branchId: string;

  @IsUUID()
  patientId: string;

  @IsString()
  issuedBy: string;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  hospitalName?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  validUntil?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items: PrescriptionItemDto[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  hospitalName?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsDate()
  @Transform(() => Date)
  validUntil?: Date;

  @IsOptional()
  @IsString()
  status?: PrescriptionStatus;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class AddPrescriptionItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  dosage: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdatePrescriptionItemDto {
  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}
