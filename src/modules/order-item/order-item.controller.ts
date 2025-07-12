import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemRequestDto, CreateOrderItemResponseDto } from './dto/create-order-item.dto';
import { OrderItemResponseDto, OrderItemsResponseDto } from './dto/get-order-item.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('order-items')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('order-items')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create order item (admin only)' })
  @ApiBody({ type: CreateOrderItemRequestDto })
  @ApiCreatedResponse({ 
    description: 'Order item created successfully',
    type: CreateOrderItemResponseDto
  })
  async create(@Body() dto: CreateOrderItemRequestDto) {
    return this.orderItemService.create(dto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get order items by order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order items retrieved successfully',
    type: OrderItemsResponseDto
  })
  async findByOrderId(@Param('orderId') orderId: string) {
    return this.orderItemService.findByOrderId(orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order item by ID' })
  @ApiParam({ name: 'id', description: 'Order Item ID' })
  @ApiOkResponse({
    description: 'Order item retrieved successfully',
    type: OrderItemResponseDto
  })
  async findOne(@Param('id') id: string) {
    return this.orderItemService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete order item (admin only)' })
  @ApiParam({ name: 'id', description: 'Order Item ID' })
  @ApiOkResponse({
    description: 'Order item deleted successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Order item deleted successfully' }
      }
    }
  })
  async remove(@Param('id') id: string) {
    return this.orderItemService.remove(id);
  }
}
