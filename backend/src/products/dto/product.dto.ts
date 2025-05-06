import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  genericName: string;

  @IsString()
  dosageForm: string;

  @IsString()
  strength: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsBoolean()
  requiresPrescription: boolean;

  @IsBoolean()
  controlled: boolean;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsString()
  @IsOptional()
  pharmacyId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  genericName?: string;

  @IsString()
  @IsOptional()
  dosageForm?: string;

  @IsString()
  @IsOptional()
  strength?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reorderLevel?: number;

  @IsBoolean()
  @IsOptional()
  requiresPrescription?: boolean;

  @IsBoolean()
  @IsOptional()
  controlled?: boolean;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;
}