import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength } from 'class-validator';
import { UserBaseDto } from './user-base.dto';

export class CreateUserRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class CreateUserResponseDto {
  @ApiProperty({ type: UserBaseDto })
  user: UserBaseDto;

  @ApiProperty()
  message: string;
}
