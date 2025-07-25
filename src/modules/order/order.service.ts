import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './order.schema';
import { CreateOrderRequestDto } from './dto/create-order.dto';
import { UpdateOrderStatusRequestDto } from './dto/update-order-status.dto';
import { UpdateOrderRequestDto } from './dto/update-order.dto';
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

  async create(userId: string, dto: CreateOrderRequestDto) {
    // Get cart items
    const cart = await this.cartService.getUserCart(userId) as CartResponse;
    
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    // Create order with items from cart
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      size: item.size,
      price: item.price,
      quantity: item.quantity
    }));

    // Create order
    const order = new this.orderModel({
      userId,
      items: orderItems,
      totalAmount,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PENDING,
      isPaid: false
    });
    
    const savedOrder = await order.save();
    
    // Clear cart
    await this.cartService.clearCart(userId);
    
    return {
      id: savedOrder.id,
      status: savedOrder.status,
      totalAmount: savedOrder.totalAmount,
      message: 'Order created successfully'
    };
  }

  async findAllByUser(userId: string) {
    const orders = await this.orderModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    
    return {
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    };
  }

  async findAll(status?: OrderStatus) {
    const query = status ? { status } : {};
    
    const orders = await this.orderModel.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .exec();
    
    return {
      orders: orders.map(order => ({
        id: order.id,
        user: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
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
        user: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        items: order.items,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
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
      user: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      items: order.items,
      isPaid: order.isPaid,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusRequestDto) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { 
        status: dto.status,
        ...(dto.isPaid !== undefined && { isPaid: dto.isPaid })
      },
      { new: true }
    ).exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    return {
      id: order.id,
      status: order.status,
      isPaid: order.isPaid,
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
