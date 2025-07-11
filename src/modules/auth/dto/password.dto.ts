import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty({ example: 'Reset token sent to email' })
  message: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ example: 'Password reset successfully' })
  message: string;
}

export class ChangePasswordRequestDto {
  @ApiProperty({ example: 'currentpassword123' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({ example: 'Password changed successfully' })
  message: string;
}
