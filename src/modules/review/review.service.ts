import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from './review.schema';
import { CreateReviewDto, ListReviewRequestDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel('Product') private productModel: Model<any>
  ) {}

  async create(productId: string, createReviewDto: CreateReviewDto) {
    // Verify product exists
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Create the review
    const review = new this.reviewModel({
      productId: new Types.ObjectId(productId),
      userId: createReviewDto.userId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment
    });
    await review.save();

    // Update product rating
    const reviews = await this.reviewModel.find({ 
      productId: new Types.ObjectId(productId) 
    }).exec();
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await this.productModel.findByIdAndUpdate(
      productId,
      { rating: Number(averageRating.toFixed(1)) },
      { new: true }
    ).exec();

    return review;
  }

  async findAll(productId: string, query: ListReviewRequestDto) {
    const { page = 1, limit = 10 } = query;
    
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ productId: new Types.ObjectId(productId) })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .exec(),
      this.reviewModel.countDocuments({ 
        productId: new Types.ObjectId(productId) 
      })
    ]);

    return {
      reviews,
      total,
      page,
      limit
    };
  }

  async findOne(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate('userId', 'name email')
      .exec();
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    
    return review;
  }

  async remove(productId: string, reviewId: string) {
    const review = await this.reviewModel.findOneAndDelete({
      _id: new Types.ObjectId(reviewId),
      productId: new Types.ObjectId(productId)
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Update product rating
    const reviews = await this.reviewModel.find({ 
      productId: new Types.ObjectId(productId) 
    }).exec();
    
    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0;

    await this.productModel.findByIdAndUpdate(
      productId,
      { rating: Number(averageRating.toFixed(1)) },
      { new: true }
    ).exec();

    return { message: 'Review deleted successfully' };
  }

  async findByUser(userId: string) {
    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('productId', 'name images')
      .exec();
  }
} 