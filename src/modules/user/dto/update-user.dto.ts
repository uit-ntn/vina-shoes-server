import { IsEmail, IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserBaseDto, UserPreferencesDto, UserAddressDto } from './user-base.dto';

export class UpdateUserRequestDto {
  @ApiPropertyOptional({ example: 'John Doe Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'updated@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

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
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ 
    type: UserPreferencesDto,
    example: { language: 'en', newsletter: false }
  })
  @IsOptional()
  preferences?: {
    language?: string;
    newsletter?: boolean;
  };

  @ApiPropertyOptional({ 
    type: [UserAddressDto],
    example: [
      {
        street: '123 Main St',
        city: 'Ho Chi Minh City',
        state: 'Ho Chi Minh',
        country: 'Vietnam',
        zipCode: '70000',
        isDefault: true,
        label: 'Home',
        phone: '+84987654321',
        recipientName: 'John Doe'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  addresses?: UserAddressDto[];
}

export class UpdateUserResponseDto {
  @ApiProperty()
  user: UserBaseDto;
  
  @ApiProperty()
  message?: string;
}
