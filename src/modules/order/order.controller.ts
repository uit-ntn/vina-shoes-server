import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiBadRequestResponse, ApiNotFoundResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderRequestDto, CreateOrderResponseDto } from './dto/create-order.dto';
import { GetOrdersQueryDto, OrderResponseDto, OrdersListResponseDto, OrderStatsResponseDto } from './dto/get-order.dto';
import { UpdateOrderStatusRequestDto, UpdateOrderStatusResponseDto } from './dto/update-order-status.dto';
import { UpdateOrderRequestDto, UpdateOrderResponseDto } from './dto/update-order.dto';
import { DeleteOrderResponseDto } from './dto/delete-order.dto';
import { CancelOrderRequestDto, CancelOrderResponseDto } from './dto/cancel-order.dto';
import { ConfirmPaymentRequestDto, ConfirmPaymentResponseDto } from './dto/payment-confirmation.dto';
import { ReorderRequestDto, ReorderResponseDto } from './dto/reorder.dto';
import { CreateReturnRequestDto, ProcessReturnRequestDto, ReturnRequestResponseDto } from './dto/return-request.dto';
import { UpdateTrackingInfoDto, ConfirmDeliveryDto, TrackingResponseDto } from './dto/tracking.dto';
import { AddOrderReviewDto, OrderReviewResponseDto } from './dto/review.dto';
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
  @ApiBadRequestResponse({ description: 'Cart is empty or invalid data' })
  async create(
    @Request() req,
    @Body() createOrderDto: CreateOrderRequestDto
  ) {
    return this.orderService.create(req.user.userId, createOrderDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (User can cancel their own pending/processing orders)' })
  @ApiResponse({ status: 200, type: CancelOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Can only cancel your own orders' })
  @ApiBadRequestResponse({ description: 'Can only cancel orders in PENDING or PROCESSING status' })
  async cancel(
    @Request() req,
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderRequestDto
  ) {
    return this.orderService.cancel(id, req.user.userId, cancelOrderDto);
  }

  @Post(':id/confirm-payment')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Confirm payment for an order (Admin)' })
  @ApiResponse({ status: 200, type: ConfirmPaymentResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'Order is already paid' })
  async confirmPayment(
    @Request() req,
    @Param('id') id: string,
    @Body() confirmPaymentDto: ConfirmPaymentRequestDto
  ) {
    return this.orderService.confirmPayment(id, confirmPaymentDto, req.user.userId);
  }

  @Post(':id/reorder')
  @ApiOperation({ summary: 'Reorder from an existing order' })
  @ApiResponse({ status: 201, type: ReorderResponseDto })
  @ApiNotFoundResponse({ description: 'Original order not found' })
  @ApiForbiddenResponse({ description: 'Can only reorder your own orders' })
  async reorder(
    @Request() req,
    @Param('id') originalOrderId: string,
    @Body() reorderDto: Omit<ReorderRequestDto, 'originalOrderId'>
  ) {
    const fullReorderDto: ReorderRequestDto = {
      ...reorderDto,
      originalOrderId
    };
    return this.orderService.reorder(req.user.userId, fullReorderDto);
  }

  @Post(':id/return-request')
  @ApiOperation({ summary: 'Create a return request for delivered order' })
  @ApiResponse({ status: 200, type: ReturnRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Can only request return for your own orders' })
  @ApiBadRequestResponse({ description: 'Can only request return for delivered orders' })
  async createReturnRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() createReturnDto: CreateReturnRequestDto
  ) {
    return this.orderService.createReturnRequest(id, req.user.userId, createReturnDto);
  }

  @Patch(':id/return-request')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Process return request (Admin)' })
  @ApiResponse({ status: 200, type: ReturnRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiBadRequestResponse({ description: 'No return request found for this order' })
  async processReturnRequest(
    @Request() req,
    @Param('id') id: string,
    @Body() processReturnDto: ProcessReturnRequestDto
  ) {
    return this.orderService.processReturnRequest(id, processReturnDto, req.user.userId);
  }

  @Put(':id/tracking')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update tracking information (Admin)' })
  @ApiResponse({ status: 200, type: TrackingResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async updateTrackingInfo(
    @Request() req,
    @Param('id') id: string,
    @Body() updateTrackingDto: UpdateTrackingInfoDto
  ) {
    return this.orderService.updateTrackingInfo(id, updateTrackingDto, req.user.userId);
  }

  @Post(':id/confirm-delivery')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Confirm delivery of an order (Admin)' })
  @ApiResponse({ status: 200, type: TrackingResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async confirmDelivery(
    @Request() req,
    @Param('id') id: string,
    @Body() confirmDeliveryDto: ConfirmDeliveryDto
  ) {
    return this.orderService.confirmDelivery(id, confirmDeliveryDto, req.user.userId);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Add rating and review for delivered order' })
  @ApiResponse({ status: 200, type: OrderReviewResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Can only review your own orders' })
  @ApiBadRequestResponse({ description: 'Can only review delivered orders or order already reviewed' })
  async addReview(
    @Request() req,
    @Param('id') id: string,
    @Body() addReviewDto: AddOrderReviewDto
  ) {
    return this.orderService.addReview(id, req.user.userId, addReviewDto);
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
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiForbiddenResponse({ description: 'Can only update your own orders' })
  @ApiBadRequestResponse({ description: 'Can only update orders in PENDING status' })
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
  @ApiOperation({ summary: 'Get all orders with advanced filtering (Admin)' })
  @ApiResponse({ status: 200, type: OrdersListResponseDto })
  async findAll(
    @Query() query: GetOrdersQueryDto
  ) {
    return this.orderService.findAll(query.status, query.paymentStatus, query.returnStatus);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get order tracking information' })
  @ApiResponse({ status: 200, type: TrackingResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getTrackingInfo(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.deliveryInfo?.trackingNumber,
      carrier: order.deliveryInfo?.carrier,
      estimatedDelivery: order.deliveryInfo?.estimatedDelivery,
      actualDelivery: order.deliveryInfo?.actualDelivery,
      deliveryNotes: order.deliveryInfo?.deliveryNotes,
      message: 'Tracking information retrieved successfully'
    };
  }

  @Patch(':id/status')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order status with notes and history tracking (Admin)' })
  @ApiResponse({ status: 200, type: UpdateOrderStatusResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusRequestDto
  ) {
    return this.orderService.updateStatus(id, updateOrderStatusDto, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete order (Admin)' })
  @ApiResponse({ status: 200, type: DeleteOrderResponseDto })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
