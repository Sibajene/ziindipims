import { IsString, IsNotEmpty } from 'class-validator';

export class RenewSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  pharmacyId: string;

  @IsString()
  @IsNotEmpty()
  subscriptionId: string;
}
