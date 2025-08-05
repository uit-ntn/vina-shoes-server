import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CancelOrderRequestDto {
  @ApiProperty({ 
    description: 'Reason for cancelling the order',
    example: 'Changed my mind',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export class CancelOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  cancelledAt: Date;

  @ApiProperty()
  cancellationReason: string;

  @ApiProperty({ example: 'Order cancelled successfully' })
  message: string;
} 