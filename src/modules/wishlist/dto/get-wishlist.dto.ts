import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetWishlistRequestDto {
  @ApiPropertyOptional({ 
    description: 'Whether to populate product details',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  populate?: boolean = false;
}

export class WishlistProductDto {
  @ApiProperty({ example: '686e554577dce804acca241a' })
  productId: string;

  @ApiProperty({ example: '2023-12-01T10:30:00.000Z' })
  addedAt: Date;

  @ApiPropertyOptional({ 
    description: 'Product details (only when populate=true)',
    example: {
      id: '686e554577dce804acca241a',
      name: 'Nike Air Max',
      price: 150,
      images: ['image1.jpg'],
      brand: 'Nike'
    }
  })
  product?: any;
}

export class GetWishlistResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '6874fca5290167e936393c78' })
  userId: string;

  @ApiProperty({ type: [WishlistProductDto] })
  products: WishlistProductDto[];

  @ApiProperty({ example: 5 })
  totalItems: number;

  @ApiProperty({ example: '2023-12-01T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-12-01T10:30:00.000Z' })
  updatedAt: Date;
} 