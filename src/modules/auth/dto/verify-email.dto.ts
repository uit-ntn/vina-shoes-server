import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
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
