import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'Nike Air Max' })
  name: string;

  @ApiProperty({ example: 'nike-air-max' })
  slug: string;

  @ApiProperty({ example: ['image1.jpg'] })
  images: string[];
}

export class OrderItemResponseDto {
  @ApiProperty({ example: '686e55be77dce804acca2547' })
  id: string;

  @ApiProperty({ example: '686e55be77dce804acca2546' })
  orderId: string;

  @ApiProperty({ example: '686e554977dce804acca244e' })
  productId: string;

  @ApiProperty({ type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ example: 41 })
  size: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 2934938 })
  price: number;
}

export class OrderItemsResponseDto {
  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];
  
  @ApiProperty()
  total: number;
}
