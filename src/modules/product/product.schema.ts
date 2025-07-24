import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum AgeGroup {
  MEN = 'men',
  WOMEN = 'women',
  KIDS = 'kids'
}

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true })
  brand: string;

  @Prop({ type: [Number], default: [] })
  sizes: number[];

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: String, enum: AgeGroup, required: true })
  ageGroup: AgeGroup;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ default: false })
  isNewArrival: boolean;

  @Prop({ type: [String], default: [] })
  styleTags: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Number, default: 0, min: 0 })
  quantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
