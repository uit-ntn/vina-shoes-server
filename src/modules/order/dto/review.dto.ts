import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class AddOrderReviewDto {
  @ApiProperty({ 
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ 
    description: 'Review text',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  review?: string;
}

export class OrderReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ required: false })
  review?: string;

  @ApiProperty()
  reviewedAt: Date;

  @ApiProperty({ example: 'Review added successfully' })
  message: string;
} 