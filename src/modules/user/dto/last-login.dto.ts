import { ApiProperty } from '@nestjs/swagger';

export class UpdateLastLoginResponseDto {
  @ApiProperty({ example: 'Last login time updated' })
  message: string;
  
  @ApiProperty({ example: '2023-08-20T10:30:00.000Z' })
  lastLoginAt: Date;
}
