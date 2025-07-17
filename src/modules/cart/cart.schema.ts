import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class CartItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 1, min: 1 })
  quantity: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;

  @Prop({ type: Date })
  lastModifiedAt: Date;
}

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Cart extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({ required: true, default: 0 })
  totalAmount: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date })
  lastModifiedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
