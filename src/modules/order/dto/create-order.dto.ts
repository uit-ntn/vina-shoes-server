import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @ApiProperty({ example: 'Street 46' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: 'HCM' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'VN' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '700000' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class CreateOrderRequestDto {
  @ApiProperty({ example: 'credit_card', enum: ['credit_card', 'paypal', 'cod'] })
  @IsString()
  @IsEnum(['credit_card', 'paypal', 'cod'])
  paymentMethod: string;

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}

export class CreateOrderResponseDto {
  @ApiProperty({ example: '686e55be77dce804acca2546' })
  id: string;

  @ApiProperty({ example: 'pending' })
  status: string;

  @ApiProperty({ example: 2934938 })
  total: number;

  @ApiProperty({ example: 'Order created successfully' })
  message: string;
}
