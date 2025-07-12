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

  async findAll(page: number, limit: number, search?: string) {
    const query = search 
      ? { name: new RegExp(search, 'i') }
      : {};

    const [products, total] = await Promise.all([
      this.productModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query)
    ]);

    return {
      products,
      total,
      page,
      limit
    };
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

  async findByCategory(categoryId: string, page: number, limit: number) {
    const [products, total] = await Promise.all([
      this.productModel.find({ categoryId })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments({ categoryId })
    ]);

    return {
      products,
      total,
      page,
      limit
    };
  }

  async updateStock(id: string, inStock: boolean): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { inStock }, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateRating(id: string, rating: number): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { rating }, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
