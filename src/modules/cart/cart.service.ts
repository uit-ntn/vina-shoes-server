import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './cart.schema';
import { AddCartItemRequestDto } from './dto/add-cart-item.dto';
import { UpdateCartItemRequestDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>
  ) {}

  async addItem(userId: string, dto: AddCartItemRequestDto): Promise<Cart> {
    // Check if this product with the same size is already in cart
    const existingItem = await this.cartModel.findOne({
      userId,
      productId: dto.productId,
      size: dto.size
    });

    if (existingItem) {
      // Update quantity instead of adding new item
      existingItem.quantity += dto.quantity;
      return existingItem.save();
    }

    // Create new cart item
    const cartItem = new this.cartModel({
      userId,
      ...dto,
      addedAt: new Date()
    });
    
    return cartItem.save();
  }

  async getUserCart(userId: string) {
    const items = await this.cartModel.find({ userId })
      .populate('productId', 'name slug price images')
      .sort({ addedAt: -1 })
      .exec();

    // Calculate totals
    let totalPrice = 0;
    const cartItems = items.map(item => {
      const price = item.productId['price'] * item.quantity;
      totalPrice += price;
      
      return {
        id: item.id,
        productId: item.productId['_id'] || item.productId,
        product: {
          name: item.productId['name'],
          slug: item.productId['slug'],
          price: item.productId['price'],
          images: item.productId['images'],
        },
        size: item.size,
        quantity: item.quantity,
        addedAt: item.addedAt
      };
    });

    return {
      items: cartItems,
      totalItems: items.length,
      totalPrice
    };
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemRequestDto): Promise<Cart> {
    const cartItem = await this.cartModel.findOne({ _id: itemId, userId });
    
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    
    cartItem.quantity = dto.quantity;
    return cartItem.save();
  }

  async removeItem(userId: string, itemId: string) {
    const result = await this.cartModel.deleteOne({ _id: itemId, userId });
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Cart item not found');
    }
    
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    await this.cartModel.deleteMany({ userId });
    return { message: 'Cart cleared successfully' };
  }

  async getCartItemCount(userId: string): Promise<number> {
    return this.cartModel.countDocuments({ userId });
  }
}
