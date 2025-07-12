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

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddCartItemRequestDto })
  @ApiCreatedResponse({ 
    description: 'Item added to cart',
    type: AddCartItemResponseDto
  })
  async addItem(@Request() req, @Body() dto: AddCartItemRequestDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user cart' })
  @ApiOkResponse({
    description: 'User cart items',
    type: GetCartResponseDto
  })
  async getUserCart(@Request() req) {
    return this.cartService.getUserCart(req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cart item' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiBody({ type: UpdateCartItemRequestDto })
  @ApiOkResponse({
    description: 'Cart item updated',
    type: UpdateCartItemResponseDto
  })
  async updateItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemRequestDto
  ) {
    await this.cartService.updateItem(req.user.userId, id, dto);
    return {
      id,
      quantity: dto.quantity,
      message: 'Cart item updated successfully'
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  @ApiOkResponse({
    description: 'Item removed from cart',
    schema: {
      properties: {
        message: { type: 'string', example: 'Item removed from cart' }
      }
    }
  })
  async removeItem(@Request() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId, id);
  }

  @Delete()
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
