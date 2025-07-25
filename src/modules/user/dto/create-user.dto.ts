import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserBaseDto, UserPreferencesDto, UserAddressDto } from './user-base.dto';

export class CreateUserRequestDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/avatars/user1.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  verificationToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  verificationExpires?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ type: UserPreferencesDto })
  @IsOptional()
  preferences?: {
    language?: string;
    newsletter?: boolean;
  };

  @ApiPropertyOptional({ type: [UserAddressDto] })
  @IsOptional()
  addresses?: UserAddressDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otpCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  otpExpiry?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otpType?: string;
}

export class CreateUserResponseDto {
  @ApiProperty({ type: UserBaseDto })
  user: UserBaseDto;

  @ApiProperty()
  message: string;
}
