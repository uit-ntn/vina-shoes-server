import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class ConfirmPaymentRequestDto {
  @ApiProperty({ 
    description: 'Payment transaction ID from payment gateway',
    example: 'txn_1234567890'
  })
  @IsString()
  @IsNotEmpty()
  paymentTransactionId: string;

  @ApiProperty({ 
    description: 'Actual amount paid',
    example: 150000
  })
  @IsNumber()
  @IsPositive()
  amountPaid: number;

  @ApiProperty({ 
    description: 'Additional notes about payment',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmPaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  paidAt: Date;

  @ApiProperty()
  paymentTransactionId: string;

  @ApiProperty({ example: 'Payment confirmed successfully' })
  message: string;
} 