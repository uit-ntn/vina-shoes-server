import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserRequestParamsDto {
  @ApiProperty()
  id: string;
}

export class DeleteUserResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}
