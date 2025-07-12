import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
