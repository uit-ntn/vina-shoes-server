import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;
}

export class UpdateCategoryResponseDto {
  @ApiProperty({ example: '686e552a77dce804acca23b1' })
  id: string;
  
  @ApiProperty({ example: 'Category updated successfully' })
  message: string;
}
