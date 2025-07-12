import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderItem } from './order-item.schema';
import { CreateOrderItemRequestDto } from './dto/create-order-item.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItem>
  ) {}

  async create(dto: CreateOrderItemRequestDto): Promise<OrderItem> {
    const orderItem = new this.orderItemModel(dto);
    return orderItem.save();
  }

  async createMany(items: CreateOrderItemRequestDto[]): Promise<OrderItem[]> {
    return this.orderItemModel.insertMany(items);
  }

  async findByOrderId(orderId: string) {
    const items = await this.orderItemModel.find({ orderId })
      .populate('productId', 'name slug images price')
      .exec();
      
    return {
      items: items.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: typeof item.productId === 'string' ? item.productId : item.productId['_id'],
        product: typeof item.productId === 'object' ? {
          name: item.productId['name'],
          slug: item.productId['slug'],
          images: item.productId['images'],
        } : undefined,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      total: items.length
    };
  }

  async findOne(id: string) {
    const item = await this.orderItemModel.findById(id)
      .populate('productId', 'name slug images price')
      .exec();
      
    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    // Check if productId is an object or string
    const productId = typeof item.productId === 'string' 
      ? item.productId 
      : item.productId['_id'];
    
    // Create product info only if productId is an object
    const product = typeof item.productId === 'object' ? {
      name: item.productId['name'],
      slug: item.productId['slug'],
      images: item.productId['images'],
    } : null;
      
    return {
      id: item.id,
      orderId: item.orderId,
      productId,
      product,
      size: item.size,
      quantity: item.quantity,
      price: item.price
    };
  }

  async remove(id: string) {
    const result = await this.orderItemModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Order item not found');
    }
    return { message: 'Order item deleted successfully' };
  }

  async removeByOrderId(orderId: string) {
    await this.orderItemModel.deleteMany({ orderId });
    return { message: 'Order items removed successfully' };
  }
}
