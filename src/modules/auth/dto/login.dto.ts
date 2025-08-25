    import { IsEmail, IsString, MinLength } from 'class-validator';
    import { ApiProperty } from '@nestjs/swagger';

    export class LoginRequestDto {
      @ApiProperty({ example: 'john@example.com' })
      @IsEmail()
      email: string;

      @ApiProperty({ example: 'password123' })
      @IsString()
      @MinLength(6)
      password: string;
    }

    export class LoginResponseDto {
      @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      })
      access_token: string;

      @ApiProperty({
        description: 'User information',
        example: {
          id: '507f1f77bcf86cd799439011',
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
