import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductBaseDto } from './product-base.dto';

export class ListProductRequestDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class ListProductResponseDto {
  @ApiProperty({ type: [ProductBaseDto] })
  products: ProductBaseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

class ProductDto {
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
