import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePlanDto {
  @IsString()
  @IsNotEmpty()
  pharmacyId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;
}
