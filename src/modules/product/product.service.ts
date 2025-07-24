import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductRequestDto } from './dto/create-product.dto';
import { UpdateProductRequestDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  async create(dto: CreateProductRequestDto): Promise<Product> {
    const product = new this.productModel(dto);
    return product.save();
  }

  async findAll() {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductRequestDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product deleted successfully' };
  }







  async getAllCategories(): Promise<string[]> {
    const products = await this.productModel.find().select('categories').exec();
    
    const allCategories = new Set<string>();
    
    products.forEach(product => {
      // Add from categories field
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(cat => allCategories.add(cat));
      }
    });
    
    return Array.from(allCategories).sort();
  }

  async getNewArrivals() {
    return this.productModel
      .find({ isNewArrival: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .exec();
  }

  async getBestSellers() {
    // For now, returning highly rated products, but you might want to
    // implement based on order statistics in the future
    return this.productModel
      .find({ rating: { $gte: 4.0 } })
      .sort({ rating: -1 })
      .limit(8)
      .exec();
  }

  async getByBrand(brand: string, page: number, limit: number) {
    const [products, total] = await Promise.all([
      this.productModel
        .find({ brand: new RegExp(brand, 'i') })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments({ brand: new RegExp(brand, 'i') })
    ]);

    return {
      products,
      total,
      page,
      limit
    };
  }
}
