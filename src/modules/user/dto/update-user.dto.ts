import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserBaseDto } from './user-base.dto';

export class UpdateUserRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateUserResponseDto {
  @ApiProperty()
  user: UserBaseDto;
  
  @ApiProperty()
  message?: string;
}
