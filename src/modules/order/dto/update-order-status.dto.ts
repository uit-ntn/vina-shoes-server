import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrderStatus } from '../order.schema';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderStatusResponseDto {
  @ApiProperty({ example: '686e55be77dce804acca2546' })
  id: string;

  @ApiProperty({ enum: OrderStatus, example: 'shipped' })
  status: OrderStatus;

  @ApiProperty({ example: 'Order status updated successfully' })
  message: string;
}
