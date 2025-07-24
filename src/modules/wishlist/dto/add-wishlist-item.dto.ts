import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistItemRequestDto {
  @ApiProperty({ 
    description: 'Product ID to add to wishlist',
    example: '686e554577dce804acca241a'
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;
}

export class AddWishlistItemResponseDto {
  @ApiProperty({ example: 'Product added to wishlist successfully' })
  message: string;

  @ApiProperty({
    description: 'Updated wishlist',
    example: {
      id: '507f1f77bcf86cd799439011',
      userId: '6874fca5290167e936393c78',
      products: [
        {
          productId: '686e554577dce804acca241a',
          addedAt: '2023-12-01T10:30:00.000Z'
        }
      ],
      createdAt: '2023-12-01T10:30:00.000Z',
      updatedAt: '2023-12-01T10:30:00.000Z'
    }
  })
  wishlist: any;
} 