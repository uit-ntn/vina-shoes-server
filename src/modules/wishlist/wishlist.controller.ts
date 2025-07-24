import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Request, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemRequestDto, AddWishlistItemResponseDto } from './dto/add-wishlist-item.dto';
import { RemoveWishlistItemRequestDto, RemoveWishlistItemResponseDto } from './dto/remove-wishlist-item.dto';
import { GetWishlistRequestDto, GetWishlistResponseDto } from './dto/get-wishlist.dto';
import { CheckWishlistRequestDto, CheckWishlistResponseDto } from './dto/check-wishlist.dto';
import { ClearWishlistResponseDto } from './dto/clear-wishlist.dto';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiQuery({ 
    name: 'populate', 
    required: false, 
    type: Boolean, 
    description: 'Whether to populate product details' 
  })
  @ApiOkResponse({
    description: 'User wishlist retrieved successfully',
    type: GetWishlistResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get()
  async getWishlist(
    @Request() req,
    @Query() query: GetWishlistRequestDto
  ) {
    return this.wishlistService.getWishlist(req.user.userId, query);
  }

  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiBody({ type: AddWishlistItemRequestDto })
  @ApiCreatedResponse({
    description: 'Product added to wishlist successfully',
    type: AddWishlistItemResponseDto
  })
  @ApiBadRequestResponse({ description: 'Product already in wishlist' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post()
  async addToWishlist(
    @Request() req,
    @Body() dto: AddWishlistItemRequestDto
  ) {
    return this.wishlistService.addToWishlist(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', description: 'Product ID to remove' })
  @ApiOkResponse({
    description: 'Product removed from wishlist successfully',
    type: RemoveWishlistItemResponseDto
  })
  @ApiNotFoundResponse({ description: 'Product not found in wishlist' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete(':productId')
  async removeFromWishlist(
    @Request() req,
    @Param('productId') productId: string
  ) {
    return this.wishlistService.removeFromWishlist(req.user.userId, { productId });
  }

  @ApiOperation({ summary: 'Check if product is in wishlist' })
  @ApiParam({ name: 'productId', description: 'Product ID to check' })
  @ApiOkResponse({
    description: 'Product wishlist status checked successfully',
    type: CheckWishlistResponseDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('check/:productId')
  async checkInWishlist(
    @Request() req,
    @Param('productId') productId: string
  ) {
    return this.wishlistService.checkInWishlist(req.user.userId, productId);
  }

  @ApiOperation({ summary: 'Get wishlist statistics' })
  @ApiOkResponse({
    description: 'Wishlist statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalItems: { type: 'number', example: 5 },
        lastUpdated: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00.000Z' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('stats')
  async getWishlistStats(@Request() req) {
    return this.wishlistService.getWishlistStats(req.user.userId);
  }

  @ApiOperation({ summary: 'Clear entire wishlist' })
  @ApiOkResponse({
    description: 'Wishlist cleared successfully',
    type: ClearWishlistResponseDto
  })
  @ApiNotFoundResponse({ description: 'Wishlist not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @Delete()
  async clearWishlist(@Request() req) {
    return this.wishlistService.clearWishlist(req.user.userId);
  }

  @ApiOperation({ summary: 'Remove multiple products from wishlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['686e554577dce804acca241a', '686e554577dce804acca241b'],
          description: 'Array of product IDs to remove'
        }
      },
      required: ['productIds']
    }
  })
  @ApiOkResponse({
    description: 'Multiple products removed from wishlist successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '2 product(s) removed from wishlist successfully' },
        removedCount: { type: 'number', example: 2 },
        wishlist: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            products: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'No matching products found in wishlist' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('multiple')
  async removeMultipleFromWishlist(
    @Request() req,
    @Body() body: { productIds: string[] }
  ) {
    return this.wishlistService.removeMultipleFromWishlist(req.user.userId, body.productIds);
  }
} 