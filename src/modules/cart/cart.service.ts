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

  // Cart CRUD operations
  async createCart(userId: string) {
    const existingCart = await this.cartModel.findOne({ 
      userId, 
      isActive: true 
    });

    if (existingCart) {
      throw new BadRequestException('User already has an active cart');
    }

    const cart = await this.cartModel.create({
      userId,
      items: [],
      totalAmount: 0,
      isActive: true,
      lastModifiedAt: new Date()
    });

    return cart;
  }

  async getUserCart(userId: string) {
    const cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    
    if (!cart) {
      return {
        id: null,
        userId,
        items: [],
        totalAmount: 0,
        isActive: false,
        createdAt: null,
        updatedAt: null
      };
    }

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.filter(item => item.isActive),
      totalAmount: cart.totalAmount,
      isActive: cart.isActive,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }

  async getAllUserCarts(userId: string) {
    const carts = await this.cartModel.find({ userId })
      .sort({ createdAt: -1 });

    return carts.map(cart => ({
      id: cart.id,
      userId: cart.userId,
      items: cart.items.filter(item => item.isActive),
      totalAmount: cart.totalAmount,
      isActive: cart.isActive,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    }));
  }

  async deactivateCart(userId: string, cartId: string) {
    const cart = await this.cartModel.findOne({ 
      _id: cartId,
      userId,
      isActive: true 
    });

    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    cart.isActive = false;
    cart.lastModifiedAt = new Date();
    await cart.save();

    return { message: 'Cart deactivated successfully' };
  }

  async deleteCart(userId: string, cartId: string) {
    const result = await this.cartModel.deleteOne({ 
      _id: cartId,
      userId 
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Cart not found');
    }

    return { message: 'Cart deleted successfully' };
  }

  // Cart Items operations
  async addItem(userId: string, dto: AddCartItemRequestDto) {
    let cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    
    if (!cart) {
      cart = await this.createCart(userId);
    }

    if (!cart) {
      throw new BadRequestException('Could not create cart');
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === dto.productId && 
              item.size === dto.size &&
              item.isActive
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += dto.quantity;
      cart.items[existingItemIndex].lastModifiedAt = new Date();
    } else {
      // Add new item
      cart.items.push({
        productId: dto.productId,
        name: dto.name,
        image: dto.image,
        size: dto.size,
        price: dto.price,
        quantity: dto.quantity,
        isActive: true,
        addedAt: new Date(),
        lastModifiedAt: new Date()
      });
    }

    // Calculate total amount from active items
    cart.totalAmount = cart.items
      .filter(item => item.isActive)
      .reduce((total, item) => total + (item.price * item.quantity), 0);

    cart.lastModifiedAt = new Date();
    const savedCart = await cart.save();
    
    return {
      id: savedCart.id,
      userId: savedCart.userId,
      items: savedCart.items.filter(item => item.isActive),
      totalAmount: savedCart.totalAmount,
      isActive: savedCart.isActive,
      createdAt: savedCart.createdAt,
      updatedAt: savedCart.updatedAt
    };
  }

  async updateItem(userId: string, productId: string, dto: UpdateCartItemRequestDto) {
    const cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    
    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.isActive
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Active cart item not found');
    }

    // Update quantity
    cart.items[itemIndex].quantity = dto.quantity;
    cart.items[itemIndex].lastModifiedAt = new Date();

    // Recalculate total amount from active items
    cart.totalAmount = cart.items
      .filter(item => item.isActive)
      .reduce((total, item) => total + (item.price * item.quantity), 0);

    cart.lastModifiedAt = new Date();
    const updatedCart = await cart.save();

    return {
      id: updatedCart.id,
      items: updatedCart.items.filter(item => item.isActive),
      totalAmount: updatedCart.totalAmount,
      message: 'Cart item updated successfully'
    };
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    
    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.isActive
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Active cart item not found');
    }

    // Soft delete item by setting isActive to false
    cart.items[itemIndex].isActive = false;
    cart.items[itemIndex].lastModifiedAt = new Date();

    // Recalculate total amount from active items
    cart.totalAmount = cart.items
      .filter(item => item.isActive)
      .reduce((total, item) => total + (item.price * item.quantity), 0);

    cart.lastModifiedAt = new Date();
    await cart.save();
    
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    
    if (cart) {
      // Soft delete all items
      cart.items.forEach(item => {
        item.isActive = false;
        item.lastModifiedAt = new Date();
      });
      cart.totalAmount = 0;
      cart.lastModifiedAt = new Date();
      await cart.save();
    }
    
    return { message: 'Cart cleared successfully' };
  }

  async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    return cart ? cart.items.filter(item => item.isActive).length : 0;
  }

  async restoreItem(userId: string, productId: string) {
    const cart = await this.cartModel.findOne({ 
      userId,
      isActive: true 
    });
    
    if (!cart) {
      throw new NotFoundException('Active cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && !item.isActive
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Inactive cart item not found');
    }

    // Restore item
    cart.items[itemIndex].isActive = true;
    cart.items[itemIndex].lastModifiedAt = new Date();

    // Recalculate total amount from active items
    cart.totalAmount = cart.items
      .filter(item => item.isActive)
      .reduce((total, item) => total + (item.price * item.quantity), 0);

    cart.lastModifiedAt = new Date();
    await cart.save();
    
    return { message: 'Item restored to cart' };
  }
}
