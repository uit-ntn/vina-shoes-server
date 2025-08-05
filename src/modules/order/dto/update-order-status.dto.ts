import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsBoolean, IsString, MaxLength } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../order.schema';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({ 
    enum: PaymentStatus,
    required: false,
    description: 'Payment status'
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ 
    description: 'Note about status change',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiProperty({ 
    description: 'Admin notes',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}

export class UpdateOrderStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty({ 
    description: 'Timestamp when status was updated'
  })
  updatedAt: Date;

  @ApiProperty({ example: 'Order status updated successfully' })
  message: string;
}
