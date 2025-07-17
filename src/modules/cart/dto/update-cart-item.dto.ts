import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsString } from 'class-validator';

export class UpdateCartItemRequestDto {
  @ApiProperty({ example: '686e554577dce804acca2425' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemResponseDto {
  @ApiProperty({ example: '686e557677dce804acca24e2' })
  id: string;

  @ApiProperty({ type: [Object] })
  items: {
    productId: string;
    name: string;
    image: string;
    size: number;
    price: number;
    quantity: number;
  }[];

  @ApiProperty({ example: 3000000 })
  totalAmount: number;

  @ApiProperty({ example: 'Cart item updated successfully' })
  message: string;
}
