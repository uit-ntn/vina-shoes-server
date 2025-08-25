import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export class WishlistProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  addedAt: Date;
}

@Schema({ timestamps: true })
export class Wishlist extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [WishlistProduct], default: [] })
  products: WishlistProduct[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

// Tạo index để optimize queries
// Removed redundant index on userId to avoid duplicate index with unique: true
WishlistSchema.index({ 'products.productId': 1 }); 