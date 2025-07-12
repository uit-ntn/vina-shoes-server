import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty()
  total: number;
  
  @ApiProperty()
  page: number;
  
  @ApiProperty()
  limit: number;
  
  @ApiProperty()
  totalPages: number;
  
  @ApiProperty({ isArray: true })
  items: T[];
}
