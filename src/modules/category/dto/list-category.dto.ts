import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class ListCategoryRequestDto {
  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class ListCategoryResponseDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '686e552a77dce804acca23b1' },
        name: { type: 'string', example: 'Sneakers' },
        slug: { type: 'string', example: 'sneakers' },
      },
    },
  })
  categories: any[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
