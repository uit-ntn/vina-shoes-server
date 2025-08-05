import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, ValidateNested, IsArray, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  size: number;
}

export class ShippingAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;
}

export class CreateOrderRequestDto {
  @ApiProperty({ 
    description: 'Payment method',
    example: 'COD'
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ 
    description: 'Shipping fee',
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number;

  @ApiProperty({ 
    description: 'Tax amount',
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ 
    description: 'Discount amount',
    required: false,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ 
    description: 'Order notes',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  finalAmount: number;

  @ApiProperty()
  message: string;
}
