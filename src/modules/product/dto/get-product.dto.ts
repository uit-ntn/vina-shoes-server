import { ApiProperty } from '@nestjs/swagger';

export class GetProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  images: string[];

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  sizes: number[];

  @ApiProperty()
  inStock: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
