import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateCartItemRequestDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemResponseDto {
  @ApiProperty({ example: '686e557677dce804acca24e2' })
  id: string;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 'Cart item updated successfully' })
  message: string;
}
