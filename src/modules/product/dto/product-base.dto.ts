import { ApiProperty } from '@nestjs/swagger';

export class ProductBaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  images: string[];

  @ApiProperty()
  brand: string;

  @ApiProperty()
  inStock: boolean;

  @ApiProperty()
  rating: number;
}
