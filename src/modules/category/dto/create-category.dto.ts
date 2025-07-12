import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoryRequestDto {
  @ApiProperty({ example: 'Sneakers' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'sneakers' })
  @IsString()
  slug: string;
}

export class CreateCategoryResponseDto {
  @ApiProperty({ example: '686e552a77dce804acca23b1' })
  id: string;
  
  @ApiProperty({ example: 'Sneakers' })
  name: string;
  
  @ApiProperty({ example: 'sneakers' })
  slug: string;
  
  @ApiProperty({ example: 'Category created successfully' })
  message: string;
}
  
