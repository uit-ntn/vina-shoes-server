import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: '686e554577dce804acca2425' })
  productId: string;

  @ApiProperty({ example: 'Nike Air Max' })
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  image: string;

  @ApiProperty({ example: 43 })
  size: number;

  @ApiProperty({ example: 1500000 })
  price: number;

  @ApiProperty({ example: 1 })
  quantity: number;
}

export class GetCartResponseDto {
  @ApiProperty({ example: '686e557677dce804acca24e2' })
  id: string;

  @ApiProperty({ example: '686e553477dce804acca23cc' })
  userId: string;

  @ApiProperty({ type: [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty({ example: 1500000 })
  totalAmount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
