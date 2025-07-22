import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, ValidateNested, IsArray, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order.schema';

export class UpdateOrderItemDto {
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

export class UpdateShippingAddressDto {
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

export class UpdateOrderRequestDto {
  @ApiProperty({ type: [UpdateOrderItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  paymentMethod?: string;

  @ApiProperty({ type: UpdateShippingAddressDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateShippingAddressDto)
  shippingAddress?: UpdateShippingAddressDto;
}

export class UpdateOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  message: string;
} 