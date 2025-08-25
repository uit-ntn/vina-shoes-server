import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmPaymentIntentRequestDto {
  @ApiProperty({ description: 'Stripe Payment Intent ID', example: 'pi_123' })
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;
}

export class ConfirmPaymentIntentResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId!: string;
} 