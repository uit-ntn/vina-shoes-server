import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckWishlistRequestDto {
  @ApiProperty({ 
    description: 'Product ID to check in wishlist',
    example: '686e554577dce804acca241a'
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;
}

export class CheckWishlistResponseDto {
  @ApiProperty({ 
    description: 'Whether the product is in wishlist',
    example: true 
  })
  isInWishlist: boolean;

  @ApiProperty({ 
    description: 'Date when product was added (if in wishlist)',
    example: '2023-12-01T10:30:00.000Z',
    required: false
  })
  addedAt?: Date;
} 