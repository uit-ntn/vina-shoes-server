import { ApiProperty } from '@nestjs/swagger';
import { AgeGroup } from '../product.schema';

export class ProductBaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  brand: string;

  @ApiProperty()
  inStock: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty()
  isNewArrival: boolean;

  @ApiProperty({ type: [String] })
  category: string[];
}
