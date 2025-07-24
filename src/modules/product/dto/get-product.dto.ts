import { ApiProperty } from '@nestjs/swagger';
import { AgeGroup } from '../product.schema';

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

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  brand: string;

  @ApiProperty({ type: [Number] })
  sizes: number[];

  @ApiProperty()
  inStock: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty({ type: [String] })
  categories: string[];

  @ApiProperty()
  isNewArrival: boolean;

  @ApiProperty({ type: [String] })
  styleTags: string[];

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: [String] })
  category: string[];

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
