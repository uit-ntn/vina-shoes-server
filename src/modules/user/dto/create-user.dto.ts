import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserBaseDto } from './user-base.dto';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  emailVerificationTokenExpires?: Date;
}

export class CreateUserResponseDto {
  @ApiProperty({ type: UserBaseDto })
  user: UserBaseDto;

  @ApiProperty()
  message: string;
}
