import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { CreateOrderRequestDto, CreateOrderResponseDto } from './dto/create-order.dto';
import { UpdateOrderStatusRequestDto, UpdateOrderStatusResponseDto } from './dto/update-order-status.dto';
import { OrderResponseDto, OrdersResponseDto } from './dto/get-order.dto';
import { OrderStatus } from './order.schema';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiBody({ type: CreateOrderRequestDto })
  @ApiCreatedResponse({ 
    description: 'Order created successfully',
    type: CreateOrderResponseDto
  })
  async create(@Request() req, @Body() dto: CreateOrderRequestDto) {
    return this.orderService.create(req.user.userId, dto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'User orders',
    type: OrdersResponseDto
  })
  async getMyOrders(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.orderService.findAllByUser(req.user.userId, page, limit);
  }

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiOkResponse({
    description: 'All orders',
    type: OrdersResponseDto
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus
  ) {
    return this.orderService.findAll(page, limit, status);
  }

  @Get('stats')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get order statistics (admin only)' })
  @ApiOkResponse({
    description: 'Order statistics',
    schema: {
      properties: {
        totalOrders: { type: 'number' },
        pendingOrders: { type: 'number' },
        processingOrders: { type: 'number' },
        shippedOrders: { type: 'number' },
        deliveredOrders: { type: 'number' },
        cancelledOrders: { type: 'number' }
      }
    }
  })
  async getStats() {
    return this.orderService.getOrderStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiOkResponse({
    description: 'Order details',
    type: OrderResponseDto
  })
  async findOne(@Param('id') id: string, @Request() req) {
    const order = await this.orderService.findOne(id);
    
    // Only admins can see others' orders
    if (req.user.role !== Role.Admin && 
        order.user && 
        order.user['_id'] && 
        order.user['_id'].toString() !== req.user.userId) {
      throw new UnauthorizedException('You are not authorized to view this order');
    }
    
    return order;
  }

  @Put(':id/status')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update order status (admin only)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: UpdateOrderStatusRequestDto })
  @ApiOkResponse({
    description: 'Order status updated',
    type: UpdateOrderStatusResponseDto
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusRequestDto
  ) {
    return this.orderService.updateStatus(id, dto);
  }
}
