import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductRequestDto {
  @ApiProperty({ example: 'Nike Air Max' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'nike-air-max' })
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  images: string[];

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  sizes: number[];
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
  createdAt: Date;
}
