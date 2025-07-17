import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.schema';

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

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty({ type: Date, nullable: true })
  paidAt: Date | null;

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress: ShippingAddressResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
