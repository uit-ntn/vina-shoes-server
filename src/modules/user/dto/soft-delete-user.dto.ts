import { ApiProperty } from '@nestjs/swagger';

export class SoftDeleteUserResponseDto {
  @ApiProperty({ example: 'User has been soft deleted' })
  message: string;
}

export class RestoreUserResponseDto {
  @ApiProperty({ example: 'User has been restored' })
  message: string;
  
  @ApiProperty({
    example: {
      id: '60d21b4667d0d8992e610c85',
      name: 'John Doe',
      email: 'john@example.com'
    }
  })
  user: {
    id: string;
    name: string;
    email: string;
  };
}
