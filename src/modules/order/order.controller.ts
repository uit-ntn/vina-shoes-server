import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderRequestDto, CreateOrderResponseDto } from './dto/create-order.dto';
import { GetOrdersQueryDto, OrderResponseDto, OrdersListResponseDto, OrderStatsResponseDto } from './dto/get-order.dto';
import { UpdateOrderStatusRequestDto, UpdateOrderStatusResponseDto } from './dto/update-order-status.dto';
import { UpdateOrderRequestDto, UpdateOrderResponseDto } from './dto/update-order.dto';
import { DeleteOrderResponseDto } from './dto/delete-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: CreateOrderResponseDto })
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderRequestDto
  ) {
    return this.orderService.create(req.user.userId, createOrderDto);
  }

  @Get('stats/overview')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get order statistics (Admin)' })
  @ApiResponse({ status: 200, type: OrderStatsResponseDto })
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, type: OrdersListResponseDto })
  async findAllByUser(
    @Request() req
  ) {
    return this.orderService.findAllByUser(req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order (Only PENDING status)' })
  @ApiResponse({ status: 200, type: UpdateOrderResponseDto })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderRequestDto
  ) {
    return this.orderService.update(id, req.user.userId, updateOrderDto);
  }

  @Get('user/:userId')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get orders by user ID (Admin)' })
  @ApiResponse({ status: 200, type: OrdersListResponseDto })
  async findByUserId(
    @Param('userId') userId: string,
    @Query() query: GetOrdersQueryDto
  ) {
    return this.orderService.findByUserId(userId, query.status);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all orders (Admin)' })
  @ApiResponse({ status: 200, type: OrdersListResponseDto })
  async findAll(
    @Query() query: GetOrdersQueryDto
  ) {
    return this.orderService.findAll(query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order status (Admin)' })
  @ApiResponse({ status: 200, type: UpdateOrderStatusResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusRequestDto
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete order (Admin)' })
  @ApiResponse({ status: 200, type: DeleteOrderResponseDto })
  async remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
