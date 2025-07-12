import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';
import { CreateCategoryRequestDto } from './dto/create-category.dto';
import { UpdateCategoryRequestDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>
  ) {}

  async create(dto: CreateCategoryRequestDto): Promise<Category> {
    const category = new this.categoryModel(dto);
    return await category.save();
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const query = search 
      ? { name: new RegExp(search, 'i') }
      : {};

    const [categories, total] = await Promise.all([
      this.categoryModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.categoryModel.countDocuments(query)
    ]);

    return {
      categories,
      total,
      page,
      limit
    };
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryRequestDto): Promise<Category> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!category) throw new NotFoundException('Category not found');
    return { message: 'Category deleted successfully' };
  }
}
