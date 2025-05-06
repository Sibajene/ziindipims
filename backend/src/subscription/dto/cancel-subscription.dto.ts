import { IsString, IsNotEmpty } from 'class-validator';

export class CancelSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  pharmacyId: string;

  @IsString()
  @IsNotEmpty()
  subscriptionId: string;
}
