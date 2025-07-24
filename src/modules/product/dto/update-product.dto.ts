import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { AgeGroup } from '../product.schema';

export class UpdateProductRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  sizes?: number[];

  @ApiProperty({ required: false, enum: AgeGroup })
  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styleTags?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class UpdateProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Number] })
  sizes: number[];

  @ApiProperty()
  inStock: boolean;

  @ApiProperty({ enum: AgeGroup })
  ageGroup: AgeGroup;

  @ApiProperty({ type: [String] })
  categories: string[];

  @ApiProperty()
  isNewArrival: boolean;

  @ApiProperty()
  quantity: number;
}

