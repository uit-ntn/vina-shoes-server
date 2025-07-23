import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export class UserPreferencesDto {
  @ApiProperty({ example: 'vi', description: 'User preferred language' })
  language: string;

  @ApiProperty({ example: true, description: 'Newsletter subscription preference' })
  newsletter: boolean;
}

export class UserAddressDto {
  @ApiProperty({ example: '123 Nguyen Hue Street' })
  street: string;

  @ApiProperty({ example: 'Ho Chi Minh City' })
  city: string;

  @ApiProperty({ example: 'Ho Chi Minh' })
  state: string;

  @ApiProperty({ example: 'Vietnam' })
  country: string;

  @ApiProperty({ example: '70000' })
  zipCode: string;

  @ApiProperty({ example: true, description: 'Whether this is the default address' })
  isDefault: boolean;

  @ApiPropertyOptional({ example: 'Home' })
  label?: string;

  @ApiPropertyOptional({ example: '+84987654321' })
  phone?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  recipientName?: string;
}

export class UserBaseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  emailVerified: boolean;

  @ApiPropertyOptional()
  lastLoginAt?: Date;

  @ApiPropertyOptional()
  passwordChangedAt?: Date;

  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiProperty({ type: UserPreferencesDto })
  preferences: UserPreferencesDto;

  @ApiProperty({ type: [UserAddressDto] })
  addresses: UserAddressDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
