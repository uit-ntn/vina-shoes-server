import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddCartItemRequestDto, AddCartItemResponseDto } from './dto/add-cart-item.dto';
import { UpdateCartItemRequestDto, UpdateCartItemResponseDto } from './dto/update-cart-item.dto';
import { GetCartResponseDto } from './dto/get-cart.dto';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Cart CRUD endpoints
  @Post()
  @ApiOperation({ summary: 'Create new cart' })
  @ApiCreatedResponse({ 
    description: 'Cart created successfully',
    type: GetCartResponseDto
  })
  async createCart(@Request() req) {
    return this.cartService.createCart(req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get active user cart' })
  @ApiOkResponse({
    description: 'User cart',
    type: GetCartResponseDto
  })
  async getUserCart(@Request() req) {
    return this.cartService.getUserCart(req.user.userId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all user carts' })
  @ApiOkResponse({
    description: 'All user carts',
    type: [GetCartResponseDto]
  })
  async getAllUserCarts(@Request() req) {
    return this.cartService.getAllUserCarts(req.user.userId);
  }

  @Put(':cartId/deactivate')
  @ApiOperation({ summary: 'Deactivate cart' })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiOkResponse({
    description: 'Cart deactivated',
    schema: {
      properties: {
        message: { type: 'string', example: 'Cart deactivated successfully' }
      }
    }
  })
  async deactivateCart(
    @Request() req,
    @Param('cartId') cartId: string
  ) {
    return this.cartService.deactivateCart(req.user.userId, cartId);
  }

  @Delete(':cartId')
  @ApiOperation({ summary: 'Delete cart' })
  @ApiParam({ name: 'cartId', description: 'Cart ID' })
  @ApiOkResponse({
    description: 'Cart deleted',
    schema: {
      properties: {
        message: { type: 'string', example: 'Cart deleted successfully' }
      }
    }
  })
  async deleteCart(
    @Request() req,
    @Param('cartId') cartId: string
  ) {
    return this.cartService.deleteCart(req.user.userId, cartId);
  }

  // Cart Items endpoints
  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddCartItemRequestDto })
  @ApiCreatedResponse({ 
    description: 'Item added to cart',
    type: AddCartItemResponseDto
  })
  async addItem(@Request() req, @Body() dto: AddCartItemRequestDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Put('items/:productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiBody({ type: UpdateCartItemRequestDto })
  @ApiOkResponse({
    description: 'Cart item updated',
    type: UpdateCartItemResponseDto
  })
  async updateItem(
    @Request() req,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemRequestDto
  ) {
    return this.cartService.updateItem(req.user.userId, productId, dto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Item removed from cart',
    schema: {
      properties: {
        message: { type: 'string', example: 'Item removed from cart' }
      }
    }
  })
  async removeItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }

  @Post('items/:productId/restore')
  @ApiOperation({ summary: 'Restore removed item to cart' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Item restored to cart',
    schema: {
      properties: {
        message: { type: 'string', example: 'Item restored to cart' }
      }
    }
  })
  async restoreItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.restoreItem(req.user.userId, productId);
  }

  @Delete('items')
  @ApiOperation({ summary: 'Clear cart' })
  @ApiOkResponse({
    description: 'Cart cleared',
    schema: {
      properties: {
        message: { type: 'string', example: 'Cart cleared successfully' }
      }
    }
  })
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get cart item count' })
  @ApiOkResponse({
    description: 'Cart item count',
    schema: {
      properties: {
        count: { type: 'number', example: 5 }
      }
    }
  })
  async getCartItemCount(@Request() req) {
    const count = await this.cartService.getCartItemCount(req.user.userId);
    return { count };
  }
}
