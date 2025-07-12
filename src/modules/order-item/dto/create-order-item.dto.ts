import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderItemRequestDto {
  @ApiProperty({ example: '686e55be77dce804acca2546' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: '686e554977dce804acca244e' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 41 })
  @IsNumber()
  size: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 2934938 })
  @IsNumber()
  price: number;
}

export class CreateOrderItemResponseDto {
  @ApiProperty({ example: '686e55be77dce804acca2547' })
  id: string;

  @ApiProperty({ example: '686e55be77dce804acca2546' })
  orderId: string;

  @ApiProperty({ example: '686e554977dce804acca244e' })
  productId: string;

  @ApiProperty({ example: 41 })
  size: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 2934938 })
  price: number;
}
