import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus, PaymentStatus, ReturnStatus } from './order.schema';
import { CreateOrderRequestDto } from './dto/create-order.dto';
import { UpdateOrderStatusRequestDto } from './dto/update-order-status.dto';
import { UpdateOrderRequestDto } from './dto/update-order.dto';
import { CancelOrderRequestDto } from './dto/cancel-order.dto';
import { ConfirmPaymentRequestDto } from './dto/payment-confirmation.dto';
import { ReorderRequestDto } from './dto/reorder.dto';
import { CreateReturnRequestDto, ProcessReturnRequestDto } from './dto/return-request.dto';
import { UpdateTrackingInfoDto, ConfirmDeliveryDto } from './dto/tracking.dto';
import { AddOrderReviewDto } from './dto/review.dto';
import { CartService } from '../cart/cart.service';
import { CartItem } from '../cart/cart.schema';

interface CartResponse {
  id: string | null;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  isActive: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  private addStatusHistory(order: Order, status: OrderStatus, note?: string, updatedBy?: string) {
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy
    });
  }

  async create(userId: string, dto: CreateOrderRequestDto) {
    // Get cart items
    const cart = await this.cartService.getUserCart(userId) as CartResponse;
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate amounts
    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    const shippingFee = dto.shippingFee || 0;
    const tax = dto.tax || 0;
    const discount = dto.discount || 0;
    const finalAmount = totalAmount + shippingFee + tax - discount;
    
    // Create order with items from cart
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: item.size,
      price: item.price,
      quantity: item.quantity
    }));

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order
    const order = new this.orderModel({
      orderNumber,
      userId,
      items: orderItems,
      totalAmount,
      shippingFee,
      tax,
      discount,
      finalAmount,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      isPaid: false,
      notes: dto.notes,
      statusHistory: [{
        status: OrderStatus.PENDING,
        timestamp: new Date(),
        note: 'Order created'
      }]
    });
    
    const savedOrder = await order.save();
    
    // Clear cart
    await this.cartService.clearCart(userId);
    
    return {
      id: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      status: savedOrder.status,
      totalAmount: savedOrder.totalAmount,
      finalAmount: savedOrder.finalAmount,
      message: 'Order created successfully'
    };
  }

  async cancel(id: string, userId: string, dto: CancelOrderRequestDto) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only allow cancelling orders that belong to the user
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Only allow cancelling orders in PENDING or PROCESSING status
    if (![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(order.status)) {
      throw new BadRequestException('Can only cancel orders in PENDING or PROCESSING status');
    }

    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = dto.reason;
    
    this.addStatusHistory(order, OrderStatus.CANCELLED, `Cancelled by user: ${dto.reason}`, userId);

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      status: updatedOrder.status,
      cancelledAt: updatedOrder.cancelledAt,
      cancellationReason: updatedOrder.cancellationReason,
      message: 'Order cancelled successfully'
    };
  }

  async confirmPayment(id: string, dto: ConfirmPaymentRequestDto, adminUserId?: string) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.isPaid) {
      throw new BadRequestException('Order is already paid');
    }

    // Update payment info
    order.isPaid = true;
    order.paymentStatus = PaymentStatus.PAID;
    order.paidAt = new Date();
    order.paymentTransactionId = dto.paymentTransactionId;
    
    if (dto.notes) {
      order.adminNotes = dto.notes;
    }

    // Update status to PROCESSING if still PENDING
    if (order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.PROCESSING;
      this.addStatusHistory(order, OrderStatus.PROCESSING, 'Payment confirmed - order processing', adminUserId);
    }

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus,
      isPaid: updatedOrder.isPaid,
      paidAt: updatedOrder.paidAt,
      paymentTransactionId: updatedOrder.paymentTransactionId,
      message: 'Payment confirmed successfully'
    };
  }

  async reorder(userId: string, dto: ReorderRequestDto) {
    const originalOrder = await this.orderModel.findById(dto.originalOrderId).exec();
    
    if (!originalOrder) {
      throw new NotFoundException('Original order not found');
    }

    // Only allow reordering own orders
    if (originalOrder.userId.toString() !== userId) {
      throw new ForbiddenException('You can only reorder your own orders');
    }

    // Generate new order number
    const orderNumber = this.generateOrderNumber();

    // Create new order with same items
    const newOrder = new this.orderModel({
      orderNumber,
      userId,
      items: originalOrder.items,
      totalAmount: originalOrder.totalAmount,
      shippingFee: originalOrder.shippingFee,
      tax: originalOrder.tax,
      discount: originalOrder.discount,
      finalAmount: originalOrder.finalAmount,
      paymentMethod: dto.paymentMethod || originalOrder.paymentMethod,
      shippingAddress: dto.shippingAddress || originalOrder.shippingAddress,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      isPaid: false,
      notes: dto.notes,
      statusHistory: [{
        status: OrderStatus.PENDING,
        timestamp: new Date(),
        note: `Reordered from ${originalOrder.orderNumber}`
      }]
    });
    
    const savedOrder = await newOrder.save();
    
    return {
      id: savedOrder.id,
      originalOrderId: dto.originalOrderId,
      status: savedOrder.status,
      totalAmount: savedOrder.totalAmount,
      message: 'Order reordered successfully'
    };
  }

  async createReturnRequest(id: string, userId: string, dto: CreateReturnRequestDto) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only allow return request for own orders
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('You can only request return for your own orders');
    }

    // Only allow return request for delivered orders
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Can only request return for delivered orders');
    }

    // Check if return already requested
    if (order.returnInfo && order.returnInfo.status !== ReturnStatus.NONE) {
      throw new BadRequestException('Return already requested for this order');
    }

    // Create return info
    order.returnInfo = {
      status: ReturnStatus.REQUESTED,
      reason: dto.reason,
      requestedAt: new Date(),
      requestedBy: userId,
      notes: dto.notes
    };

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      returnStatus: updatedOrder.returnInfo?.status!,
      reason: updatedOrder.returnInfo?.reason!,
      requestedAt: updatedOrder.returnInfo?.requestedAt!,
      message: 'Return request created successfully'
    };
  }

  async processReturnRequest(id: string, dto: ProcessReturnRequestDto, adminUserId: string) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.returnInfo) {
      throw new BadRequestException('No return request found for this order');
    }

    // Update return info
    order.returnInfo.status = dto.status;
    
    if (dto.status === ReturnStatus.APPROVED) {
      order.returnInfo.approvedAt = new Date();
      order.returnInfo.approvedBy = adminUserId;
    }
    
    if (dto.returnTrackingNumber) {
      order.returnInfo.returnTrackingNumber = dto.returnTrackingNumber;
    }
    
    if (dto.refundAmount) {
      order.returnInfo.refundAmount = dto.refundAmount;
    }
    
    if (dto.status === ReturnStatus.REFUNDED) {
      order.returnInfo.refundedAt = new Date();
      order.status = OrderStatus.REFUNDED;
      order.paymentStatus = PaymentStatus.REFUNDED;
      this.addStatusHistory(order, OrderStatus.REFUNDED, 'Order refunded', adminUserId);
    } else if (dto.status === ReturnStatus.RETURNED) {
      order.status = OrderStatus.RETURNED;
      this.addStatusHistory(order, OrderStatus.RETURNED, 'Order returned', adminUserId);
    }
    
    if (dto.notes) {
      order.returnInfo.notes = dto.notes;
    }

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      returnStatus: updatedOrder.returnInfo?.status!,
      reason: updatedOrder.returnInfo?.reason!,
      requestedAt: updatedOrder.returnInfo?.requestedAt!,
      approvedAt: updatedOrder.returnInfo?.approvedAt,
      returnTrackingNumber: updatedOrder.returnInfo?.returnTrackingNumber,
      refundAmount: updatedOrder.returnInfo?.refundAmount,
      refundedAt: updatedOrder.returnInfo?.refundedAt,
      message: 'Return request processed successfully'
    };
  }

  async updateTrackingInfo(id: string, dto: UpdateTrackingInfoDto, adminUserId: string) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create or update delivery info
    if (!order.deliveryInfo) {
      order.deliveryInfo = {};
    }

    order.deliveryInfo.trackingNumber = dto.trackingNumber;
    order.deliveryInfo.carrier = dto.carrier;
    
    if (dto.estimatedDelivery) {
      order.deliveryInfo.estimatedDelivery = new Date(dto.estimatedDelivery);
    }
    
    if (dto.deliveryNotes) {
      order.deliveryInfo.deliveryNotes = dto.deliveryNotes;
    }

    // Update status to SHIPPED if not already
    if (order.status === OrderStatus.READY_TO_SHIP || order.status === OrderStatus.PICKED_UP) {
      order.status = OrderStatus.SHIPPED;
      this.addStatusHistory(order, OrderStatus.SHIPPED, 'Package shipped with tracking info', adminUserId);
    }

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      trackingNumber: updatedOrder.deliveryInfo?.trackingNumber!,
      carrier: updatedOrder.deliveryInfo?.carrier!,
      estimatedDelivery: updatedOrder.deliveryInfo?.estimatedDelivery,
      actualDelivery: updatedOrder.deliveryInfo?.actualDelivery,
      deliveryNotes: updatedOrder.deliveryInfo?.deliveryNotes,
      message: 'Tracking information updated successfully'
    };
  }

  async confirmDelivery(id: string, dto: ConfirmDeliveryDto, adminUserId?: string) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Create delivery info if not exists
    if (!order.deliveryInfo) {
      order.deliveryInfo = {};
    }

    order.deliveryInfo.actualDelivery = new Date(dto.actualDelivery);
    
    if (dto.deliveryNotes) {
      order.deliveryInfo.deliveryNotes = dto.deliveryNotes;
    }

    // Update status to DELIVERED
    order.status = OrderStatus.DELIVERED;
    this.addStatusHistory(order, OrderStatus.DELIVERED, 'Package delivered successfully', adminUserId);

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      actualDelivery: updatedOrder.deliveryInfo?.actualDelivery,
      message: 'Delivery confirmed successfully'
    };
  }

  async addReview(id: string, userId: string, dto: AddOrderReviewDto) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only allow reviewing own orders
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('You can only review your own orders');
    }

    // Only allow reviewing delivered orders
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Can only review delivered orders');
    }

    // Check if already reviewed
    if (order.rating) {
      throw new BadRequestException('Order already reviewed');
    }

    // Add review
    order.rating = dto.rating;
    order.review = dto.review;
    order.reviewedAt = new Date();

    const updatedOrder = await order.save();

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      rating: updatedOrder.rating,
      review: updatedOrder.review,
      reviewedAt: updatedOrder.reviewedAt,
      message: 'Review added successfully'
    };
  }

  async findAllByUser(userId: string) {
    const orders = await this.orderModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    
    return {
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        tax: order.tax,
        discount: order.discount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        paymentTransactionId: order.paymentTransactionId,
        statusHistory: order.statusHistory,
        deliveryInfo: order.deliveryInfo,
        returnInfo: order.returnInfo,
        notes: order.notes,
        adminNotes: order.adminNotes,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
        rating: order.rating,
        review: order.review,
        reviewedAt: order.reviewedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    };
  }

  async findAll(status?: OrderStatus, paymentStatus?: PaymentStatus, returnStatus?: ReturnStatus) {
    const query: any = {};
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (returnStatus) query['returnInfo.status'] = returnStatus;
    
    const orders = await this.orderModel.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .exec();
    
    return {
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        user: order.userId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        tax: order.tax,
        discount: order.discount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        paymentTransactionId: order.paymentTransactionId,
        statusHistory: order.statusHistory,
        deliveryInfo: order.deliveryInfo,
        returnInfo: order.returnInfo,
        notes: order.notes,
        adminNotes: order.adminNotes,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
        rating: order.rating,
        review: order.review,
        reviewedAt: order.reviewedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    };
  }

  async findByUserId(userId: string, status?: OrderStatus) {
    const query = { userId, ...(status && { status }) };
    
    const orders = await this.orderModel.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .exec();

    if (!orders.length) {
      throw new NotFoundException('No orders found for this user');
    }
    
    return {
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        user: order.userId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        shippingFee: order.shippingFee,
        tax: order.tax,
        discount: order.discount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        paymentTransactionId: order.paymentTransactionId,
        statusHistory: order.statusHistory,
        deliveryInfo: order.deliveryInfo,
        returnInfo: order.returnInfo,
        notes: order.notes,
        adminNotes: order.adminNotes,
        cancelledAt: order.cancelledAt,
        cancellationReason: order.cancellationReason,
        rating: order.rating,
        review: order.review,
        reviewedAt: order.reviewedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    };
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id)
      .populate('userId', 'name email')
      .exec();
      
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      user: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      tax: order.tax,
      discount: order.discount,
      finalAmount: order.finalAmount,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      items: order.items,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      paymentTransactionId: order.paymentTransactionId,
      statusHistory: order.statusHistory,
      deliveryInfo: order.deliveryInfo,
      returnInfo: order.returnInfo,
      notes: order.notes,
      adminNotes: order.adminNotes,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      rating: order.rating,
      review: order.review,
      reviewedAt: order.reviewedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusRequestDto, adminUserId?: string) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update status
    order.status = dto.status;
    
    if (dto.paymentStatus !== undefined) {
      order.paymentStatus = dto.paymentStatus;
    }
    
    if (dto.isPaid !== undefined) {
      order.isPaid = dto.isPaid;
    }
    
    if (dto.adminNotes) {
      order.adminNotes = dto.adminNotes;
    }

    // Add to status history
    this.addStatusHistory(order, dto.status, dto.note, adminUserId);

    const updatedOrder = await order.save();
    
    return {
      id: updatedOrder.id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      isPaid: updatedOrder.isPaid,
      updatedAt: updatedOrder.updatedAt,
      message: 'Order status updated successfully'
    };
  }

  async update(id: string, userId: string, dto: UpdateOrderRequestDto) {
    const order = await this.orderModel.findById(id).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Only allow updating orders that belong to the user
    if (order.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own orders');
    }

    // Only allow updating orders in PENDING status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only update orders in PENDING status');
    }

    // Calculate new total amount if items are updated
    let totalAmount = order.totalAmount;
    if (dto.items && dto.items.length > 0) {
      totalAmount = dto.items.reduce((total, item) => {
        const originalItem = order.items.find(i => i.productId.toString() === item.productId);
        if (!originalItem) {
          throw new BadRequestException(`Item with id ${item.productId} not found in order`);
        }
        return total + (originalItem.price * item.quantity);
      }, 0);
    }

    // Prepare update data
    const updateData: Partial<Order> = {};

    if (dto.items && dto.items.length > 0) {
      updateData.items = order.items.map(item => {
        const updatedItem = dto.items?.find(i => i.productId === item.productId.toString());
        if (updatedItem) {
          return {
            ...item,
            quantity: updatedItem.quantity,
            size: updatedItem.size
          };
        }
        return item;
      });
      updateData.totalAmount = totalAmount;
      
      // Recalculate final amount
      const shippingFee = order.shippingFee || 0;
      const tax = order.tax || 0;
      const discount = order.discount || 0;
      updateData.finalAmount = totalAmount + shippingFee + tax - discount;
    }

    if (dto.paymentMethod) {
      updateData.paymentMethod = dto.paymentMethod;
    }

    if (dto.shippingAddress) {
      updateData.shippingAddress = dto.shippingAddress;
    }

    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!updatedOrder) {
      throw new NotFoundException('Failed to update order');
    }

    return {
      id: updatedOrder.id,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
      finalAmount: updatedOrder.finalAmount,
      message: 'Order updated successfully'
    };
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return { message: 'Order deleted successfully' };
  }

  async getOrderStats() {
    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      returned,
      refunded,
      revenue
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }),
      this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED }),
      this.orderModel.countDocuments({ status: OrderStatus.RETURNED }),
      this.orderModel.countDocuments({ status: OrderStatus.REFUNDED }),
      this.orderModel.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$finalAmount' },
            paidRevenue: { 
              $sum: { 
                $cond: [{ $eq: ['$isPaid', true] }, '$finalAmount', 0] 
              } 
            },
            pendingRevenue: { 
              $sum: { 
                $cond: [{ $eq: ['$isPaid', false] }, '$finalAmount', 0] 
              } 
            }
          }
        }
      ])
    ]);
    
    const revenueData = revenue[0] || { totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0 };
    
    return {
      totalOrders: total,
      pendingOrders: pending,
      processingOrders: processing,
      shippedOrders: shipped,
      deliveredOrders: delivered,
      cancelledOrders: cancelled,
      returnedOrders: returned,
      refundedOrders: refunded,
      totalRevenue: revenueData.totalRevenue,
      paidRevenue: revenueData.paidRevenue,
      pendingRevenue: revenueData.pendingRevenue
    };
  }
}
