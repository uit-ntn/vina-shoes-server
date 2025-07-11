import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty({
    example: {
      id: '1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user'
    }
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
