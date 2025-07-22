import { ApiProperty } from '@nestjs/swagger';

export class DeleteOrderResponseDto {
  @ApiProperty({ example: 'Order deleted successfully' })
  message: string;
} 