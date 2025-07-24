import { ApiProperty } from '@nestjs/swagger';

export class ClearWishlistResponseDto {
  @ApiProperty({ example: 'Wishlist cleared successfully' })
  message: string;

  @ApiProperty({ 
    description: 'Number of items removed',
    example: 5 
  })
  removedCount: number;
} 