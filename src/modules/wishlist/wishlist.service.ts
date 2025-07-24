import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist } from './wishlist.schema';
import { AddWishlistItemRequestDto } from './dto/add-wishlist-item.dto';
import { RemoveWishlistItemRequestDto } from './dto/remove-wishlist-item.dto';
import { GetWishlistRequestDto } from './dto/get-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>
  ) {}

  /**
   * Get user's wishlist
   */
  async getWishlist(userId: string, query: GetWishlistRequestDto) {
    const { populate = false } = query;

    let wishlistQuery = this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (populate) {
      wishlistQuery = wishlistQuery.populate({
        path: 'products.productId',
        select: 'name price images brand description sizes colors inStock',
        model: 'Product'
      });
    }

    const wishlist = await wishlistQuery.exec();

    if (!wishlist) {
      // Create empty wishlist if doesn't exist
      const newWishlist = new this.wishlistModel({
        userId: new Types.ObjectId(userId),
        products: []
      });
      await newWishlist.save();
      
      return {
        id: newWishlist._id.toString(),
        userId,
        products: [],
        totalItems: 0,
        createdAt: newWishlist.createdAt,
        updatedAt: newWishlist.updatedAt
      };
    }

    return {
      id: wishlist._id.toString(),
      userId,
      products: wishlist.products.map(item => ({
        productId: item.productId.toString(),
        addedAt: item.addedAt,
        ...(populate && item.productId && typeof item.productId === 'object' ? 
          { product: item.productId } : {})
      })),
      totalItems: wishlist.products.length,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt
    };
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(userId: string, dto: AddWishlistItemRequestDto) {
    const { productId } = dto;
    const productObjectId = new Types.ObjectId(productId);

    // Check if wishlist exists
    let wishlist = await this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new this.wishlistModel({
        userId: new Types.ObjectId(userId),
        products: []
      });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.productId.toString() === productId
    );

    if (existingProduct) {
      throw new BadRequestException('Product is already in wishlist');
    }

    // Add product to wishlist
    wishlist.products.push({
      productId: productObjectId,
      addedAt: new Date()
    });

    wishlist.updatedAt = new Date();
    await wishlist.save();

    return {
      message: 'Product added to wishlist successfully',
      wishlist: {
        id: wishlist._id.toString(),
        userId,
        products: wishlist.products.map(item => ({
          productId: item.productId.toString(),
          addedAt: item.addedAt
        })),
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
      }
    };
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(userId: string, dto: RemoveWishlistItemRequestDto) {
    const { productId } = dto;

    const wishlist = await this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    // Check if product exists in wishlist
    const productIndex = wishlist.products.findIndex(
      item => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      throw new NotFoundException('Product not found in wishlist');
    }

    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    wishlist.updatedAt = new Date();
    await wishlist.save();

    return {
      message: 'Product removed from wishlist successfully',
      wishlist: {
        id: wishlist._id.toString(),
        userId,
        products: wishlist.products.map(item => ({
          productId: item.productId.toString(),
          addedAt: item.addedAt
        })),
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
      }
    };
  }

  /**
   * Check if product is in wishlist
   */
  async checkInWishlist(userId: string, productId: string) {
    const wishlist = await this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!wishlist) {
      return {
        isInWishlist: false
      };
    }

    const product = wishlist.products.find(
      item => item.productId.toString() === productId
    );

    return {
      isInWishlist: !!product,
      ...(product ? { addedAt: product.addedAt } : {})
    };
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: string) {
    const wishlist = await this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const removedCount = wishlist.products.length;
    wishlist.products = [];
    wishlist.updatedAt = new Date();
    await wishlist.save();

    return {
      message: 'Wishlist cleared successfully',
      removedCount
    };
  }

  /**
   * Get wishlist statistics for user
   */
  async getWishlistStats(userId: string) {
    const wishlist = await this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!wishlist) {
      return {
        totalItems: 0,
        lastUpdated: null
      };
    }

    return {
      totalItems: wishlist.products.length,
      lastUpdated: wishlist.updatedAt
    };
  }

  /**
   * Remove multiple products from wishlist
   */
  async removeMultipleFromWishlist(userId: string, productIds: string[]) {
    const wishlist = await this.wishlistModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const initialCount = wishlist.products.length;
    
    // Remove products that match the provided IDs
    wishlist.products = wishlist.products.filter(
      item => !productIds.includes(item.productId.toString())
    );

    const removedCount = initialCount - wishlist.products.length;
    
    if (removedCount === 0) {
      throw new NotFoundException('No matching products found in wishlist');
    }

    wishlist.updatedAt = new Date();
    await wishlist.save();

    return {
      message: `${removedCount} product(s) removed from wishlist successfully`,
      removedCount,
      wishlist: {
        id: wishlist._id.toString(),
        userId,
        products: wishlist.products.map(item => ({
          productId: item.productId.toString(),
          addedAt: item.addedAt
        })),
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
      }
    };
  }
} 