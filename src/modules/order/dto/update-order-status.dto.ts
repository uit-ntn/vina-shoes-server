import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../order.schema';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderStatusResponseDto {
  @ApiProperty({ example: '686e557677dce804acca24e2' })
  id: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  status: OrderStatus;

  @ApiProperty({ example: 'Order status updated successfully' })
  message: string;
}
