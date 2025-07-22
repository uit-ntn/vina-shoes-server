import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.schema';
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

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress: ShippingAddressResponseDto;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  paidAt: Date;

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
}
