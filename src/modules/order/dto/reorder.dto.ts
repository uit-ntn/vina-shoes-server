import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddressDto } from './create-order.dto';

export class ReorderRequestDto {
  @ApiProperty({ 
    description: 'Original order ID to reorder from',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  originalOrderId: string;

  @ApiProperty({ 
    description: 'New payment method (optional, uses original if not provided)',
    required: false
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ 
    description: 'New shipping address (optional, uses original if not provided)',
    type: ShippingAddressDto,
    required: false
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiProperty({ 
    description: 'Additional notes for the new order',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReorderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  originalOrderId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ example: 'Order reordered successfully' })
  message: string;
} 