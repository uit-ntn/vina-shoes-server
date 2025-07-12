import { ApiProperty } from '@nestjs/swagger';

export class DeleteCategoryResponseDto {
  @ApiProperty({ example: 'Category deleted successfully' })
  message: string;
}
