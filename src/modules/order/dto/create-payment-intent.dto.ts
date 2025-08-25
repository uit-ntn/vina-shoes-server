import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentResponseDto {
  @ApiProperty({ description: 'Stripe Payment Intent client secret' })
  @IsString()
  @IsNotEmpty()
  clientSecret!: string;

  @ApiProperty({ description: 'Stripe publishable key to initialize Stripe.js on client' })
  @IsString()
  @IsNotEmpty()
  publishableKey!: string;

  @ApiProperty({ description: 'Currency used for the payment (e.g., vnd)' })
  @IsString()
  @IsNotEmpty()
  currency!: string;

  @ApiProperty({ description: 'Order ID for which the payment is created' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;
} 