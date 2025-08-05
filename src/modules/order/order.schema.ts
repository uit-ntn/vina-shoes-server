import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_TO_SHIP = 'ready_to_ship',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum ReturnStatus {
  NONE = 'none',
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

@Schema()
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  quantity: number;
}

@Schema()
export class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  addressLine: string;

  @Prop({ required: true })
  ward: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  city: string;
}

@Schema()
export class StatusHistory {
  @Prop({ required: true, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop()
  note?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  updatedBy?: string;
}

@Schema()
export class DeliveryInfo {
  @Prop()
  trackingNumber?: string;

  @Prop()
  carrier?: string;

  @Prop()
  estimatedDelivery?: Date;

  @Prop()
  actualDelivery?: Date;

  @Prop()
  deliveryNotes?: string;
}

@Schema()
export class ReturnInfo {
  @Prop({ enum: ReturnStatus, default: ReturnStatus.NONE })
  status: ReturnStatus;

  @Prop()
  reason?: string;

  @Prop()
  requestedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  requestedBy?: string;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  approvedBy?: string;

  @Prop()
  returnTrackingNumber?: string;

  @Prop()
  refundAmount?: number;

  @Prop()
  refundedAt?: Date;

  @Prop()
  notes?: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  shippingFee: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  finalAmount: number;

  @Prop({ default: OrderStatus.PENDING, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ type: [StatusHistory], default: [] })
  statusHistory: StatusHistory[];

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ type: Date, default: null })
  paidAt: Date;

  @Prop()
  paymentTransactionId?: string;

  @Prop({ type: DeliveryInfo })
  deliveryInfo?: DeliveryInfo;

  @Prop({ type: ReturnInfo })
  returnInfo?: ReturnInfo;

  @Prop()
  notes?: string;

  @Prop()
  adminNotes?: string;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ min: 1, max: 5 })
  rating?: number;

  @Prop()
  review?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
