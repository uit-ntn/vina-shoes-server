import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddCartItemRequestDto {
  @ApiProperty({ example: '686e554577dce804acca2425' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ example: 43 })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class AddCartItemResponseDto {
  @ApiProperty({ example: '686e557677dce804acca24e2' })
  id: string;

  @ApiProperty({ example: '686e553477dce804acca23cc' })
  userId: string;

  @ApiProperty({ example: '686e554577dce804acca2425' })
  productId: string;

  @ApiProperty({ example: 43 })
  size: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty()
  addedAt: Date;
}
