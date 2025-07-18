import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateReviewDto {
  @ApiProperty({ example: 'Tốt lắm!', description: 'Review comment' })
  @IsString()
  comment: string;

  @ApiProperty({ example: 5, description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'User ID' })
  @IsMongoId()
  userId: Types.ObjectId;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  productId: Types.ObjectId;

  @ApiProperty()
  userId: Types.ObjectId;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ListReviewRequestDto {
  @ApiProperty({ required: false, default: 1 })
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  limit?: number;
} 