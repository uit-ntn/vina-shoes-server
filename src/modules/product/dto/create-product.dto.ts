import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { AgeGroup } from '../product.schema';

export class CreateProductRequestDto {
  @ApiProperty({ example: 'Nike Air Max' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'nike-air-max' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'Description for Nike Air Max' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1110302 })
  @IsNumber()
  price: number;

  @ApiProperty({ type: [String], example: ['https://example.com/product.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ example: 'Nike' })
  @IsString()
  brand: string;

  @ApiProperty({ type: [Number], example: [38, 39, 40, 41, 42] })
  @IsArray()
  @IsNumber({}, { each: true })
  sizes: number[];

  @ApiProperty({ enum: AgeGroup, example: AgeGroup.MEN })
  @IsEnum(AgeGroup)
  ageGroup: AgeGroup;

  @ApiProperty({ type: [String], example: ['men', 'formal', 'sport'] })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @ApiProperty({ type: [String], example: ['formal', 'sport'] })
  @IsArray()
  @IsString({ each: true })
  styleTags: string[];

  @ApiProperty({ type: [String], example: ['lifestyle'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantity: number;
}

export class CreateProductResponseDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  slug: string;
  
  @ApiProperty()
  message: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  createdAt: Date;
}
