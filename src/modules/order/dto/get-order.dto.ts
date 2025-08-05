import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, ReturnStatus } from '../order.schema';
import { IsOptional, IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class OrderItemResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;
}

export class ShippingAddressResponseDto {
  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  addressLine: string;

  @ApiProperty()
  ward: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  city: string;
}

export class StatusHistoryResponseDto {
  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty({ required: false })
  note?: string;

  @ApiProperty({ required: false })
  updatedBy?: string;
}

export class DeliveryInfoResponseDto {
  @ApiProperty({ required: false })
  trackingNumber?: string;

  @ApiProperty({ required: false })
  carrier?: string;

  @ApiProperty({ required: false })
  estimatedDelivery?: Date;

  @ApiProperty({ required: false })
  actualDelivery?: Date;

  @ApiProperty({ required: false })
  deliveryNotes?: string;
}

export class ReturnInfoResponseDto {
  @ApiProperty({ enum: ReturnStatus })
  status: ReturnStatus;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false })
  requestedAt?: Date;

  @ApiProperty({ required: false })
  requestedBy?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  approvedBy?: string;

  @ApiProperty({ required: false })
  returnTrackingNumber?: string;

  @ApiProperty({ required: false })
  refundAmount?: number;

  @ApiProperty({ required: false })
  refundedAt?: Date;

  @ApiProperty({ required: false })
  notes?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  shippingFee: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  finalAmount: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress: ShippingAddressResponseDto;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty({ required: false })
  paidAt?: Date;

  @ApiProperty({ required: false })
  paymentTransactionId?: string;

  @ApiProperty({ type: [StatusHistoryResponseDto] })
  statusHistory: StatusHistoryResponseDto[];

  @ApiProperty({ type: DeliveryInfoResponseDto, required: false })
  deliveryInfo?: DeliveryInfoResponseDto;

  @ApiProperty({ type: ReturnInfoResponseDto, required: false })
  returnInfo?: ReturnInfoResponseDto;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty({ required: false })
  cancelledAt?: Date;

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 5 })
  rating?: number;

  @ApiProperty({ required: false })
  review?: string;

  @ApiProperty({ required: false })
  reviewedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetOrdersQueryDto {
  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ required: false, enum: ReturnStatus })
  @IsOptional()
  @IsEnum(ReturnStatus)
  returnStatus?: ReturnStatus;
}

export class GetOrdersByUserIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ required: false, enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class OrdersListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];
}

export class OrderStatsResponseDto {
  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  pendingOrders: number;

  @ApiProperty()
  processingOrders: number;

  @ApiProperty()
  shippedOrders: number;

  @ApiProperty()
  deliveredOrders: number;

  @ApiProperty()
  cancelledOrders: number;

  @ApiProperty()
  returnedOrders: number;

  @ApiProperty()
  refundedOrders: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  paidRevenue: number;

  @ApiProperty()
  pendingRevenue: number;
}
