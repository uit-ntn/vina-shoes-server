import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './order.schema';
import { CreateOrderRequestDto } from './dto/create-order.dto';
import { UpdateOrderStatusRequestDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { OrderItemService } from '../order-item/order-item.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private cartService: CartService,
    private orderItemService: OrderItemService
  ) {}

  async create(userId: string, dto: CreateOrderRequestDto) {
    // Get cart items
    const cart = await this.cartService.getUserCart(userId);
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    
    // Create order
    const order = new this.orderModel({
      userId,
      total: cart.totalPrice,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PENDING
    });
    
    const savedOrder = await order.save();
    
    // Create order items
    const orderItems = cart.items.map(item => ({
      orderId: savedOrder.id,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price * item.quantity
    }));
    
    await this.orderItemService.createMany(orderItems);
    
    // Clear cart
    await this.cartService.clearCart(userId);
    
    return {
      id: savedOrder.id,
      status: savedOrder.status,
      total: savedOrder.total,
      message: 'Order created successfully'
    };
  }

  async findAllByUser(userId: string, page: number = 1, limit: number = 10) {
    const [orders, total] = await Promise.all([
      this.orderModel.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments({ userId })
    ]);
    
    const ordersList = await Promise.all(orders.map(async order => {
      const { items } = await this.orderItemService.findByOrderId(order.id);
        
      return {
        id: order.id,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }));
    
    return {
      orders: ordersList,
      total,
      page,
      limit
    };
  }

  async findAll(page: number = 1, limit: number = 10, status?: OrderStatus) {
    const query = status ? { status } : {};
    
    const [orders, total] = await Promise.all([
      this.orderModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .exec(),
      this.orderModel.countDocuments(query)
    ]);
    
    const ordersList = await Promise.all(orders.map(async order => {
      const { items } = await this.orderItemService.findByOrderId(order.id);
        
      return {
        id: order.id,
        user: order.userId,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }));
    
    return {
      orders: ordersList,
      total,
      page,
      limit
    };
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id)
      .populate('userId', 'name email')
      .exec();
      
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    const { items } = await this.orderItemService.findByOrderId(order.id);
      
    return {
      id: order.id,
      user: order.userId,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusRequestDto) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status: dto.status },
      { new: true }
    ).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return {
      id: order.id,
      status: order.status,
      message: 'Order status updated successfully'
    };
  }

  async remove(id: string) {
    const order = await this.orderModel.findByIdAndDelete(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    // Remove associated order items
    await this.orderItemService.removeByOrderId(id);
    
    return { message: 'Order deleted successfully' };
  }

  async getOrderStats() {
    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: OrderStatus.PENDING }),
      this.orderModel.countDocuments({ status: OrderStatus.PROCESSING }),
      this.orderModel.countDocuments({ status: OrderStatus.SHIPPED }),
      this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }),
      this.orderModel.countDocuments({ status: OrderStatus.CANCELLED })
    ]);
    
    return {
      totalOrders: total,
      pendingOrders: pending,
      processingOrders: processing,
      shippedOrders: shipped,
      deliveredOrders: delivered,
      cancelledOrders: cancelled
    };
  }
}
