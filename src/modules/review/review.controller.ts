import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiQuery, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse 
} from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto, ReviewResponseDto, ListReviewRequestDto } from './dto/review.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('products/:productId')
  @ApiOperation({ summary: 'Create a new review' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiBody({ type: CreateReviewDto })
  @ApiCreatedResponse({
    description: 'Review created successfully',
    type: ReviewResponseDto
  })
  create(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto
  ) {
    return this.reviewService.create(productId, createReviewDto);
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Reviews retrieved successfully',
    type: [ReviewResponseDto]
  })
  findAll(
    @Param('productId') productId: string,
    @Query() query: ListReviewRequestDto
  ) {
    return this.reviewService.findAll(productId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiOkResponse({
    description: 'Review retrieved successfully',
    type: ReviewResponseDto
  })
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Delete('products/:productId/:reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiOkResponse({
    description: 'Review deleted successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Review deleted successfully' }
      }
    }
  })
  remove(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string
  ) {
    return this.reviewService.remove(productId, reviewId);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get all reviews by a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({
    description: 'User reviews retrieved successfully',
    type: [ReviewResponseDto]
  })
  findByUser(@Param('userId') userId: string) {
    return this.reviewService.findByUser(userId);
  }
} 