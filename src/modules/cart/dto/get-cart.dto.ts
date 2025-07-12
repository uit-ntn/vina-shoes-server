import { ApiProperty } from '@nestjs/swagger';

class ProductDto {
  @ApiProperty({ example: 'Nike Air Max' })
  name: string;

  @ApiProperty({ example: 'nike-air-max' })
  slug: string;

  @ApiProperty({ example: 199.99 })
  price: number;

  @ApiProperty({ example: ['image1.jpg'] })
  images: string[];
}

export class CartItemDto {
  @ApiProperty({ example: '686e557677dce804acca24e2' })
  id: string;

  @ApiProperty({ example: '686e554577dce804acca2425' })
  productId: string;

  @ApiProperty({ type: ProductDto })
  product: ProductDto;

  @ApiProperty({ example: 43 })
  size: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty()
  addedAt: Date;
}

export class GetCartResponseDto {
  @ApiProperty({ type: [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty({ example: 2 })
  totalItems: number;

  @ApiProperty({ example: 399.98 })
  totalPrice: number;
}
