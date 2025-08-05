import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class VerifyEmailTokenDto {
  @ApiProperty({
    description: 'The verification token sent to email',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'The email address to resend verification to',
    example: 'user@example.com'
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
