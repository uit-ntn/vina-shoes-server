import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { OrderStatus } from '../order.schema';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

export class UpdateOrderStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  message: string;
}
