import { IsString, IsNumber, IsDate, IsOptional, IsUUID, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBatchDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  branchId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  batchNumber: string;

  @IsDate()
  @Type(() => Date)
  expiryDate: Date;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateBatchDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class TransferItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  batchId?: string;
}

export class TransferStockDto {
  @IsUUID()
  fromBranchId: string;

  @IsUUID()
  toBranchId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  requestedBy: string;
}
