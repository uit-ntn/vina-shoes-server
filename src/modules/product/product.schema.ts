import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: string;

  @Prop()
  brand: string;

  @Prop({ type: [Number] })
  sizes: number[];

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ type: Number, default: 0 })
  rating: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
