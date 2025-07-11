import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  passwordHash: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  constructor(user: UserDto) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
  }
}

export class UserListResponseDto {
  users: UserResponseDto[];

  constructor(users: UserDto[]) {
    this.users = users.map(user => new UserResponseDto(user));
  }
}

export class UserDetailResponseDto {
  user: UserResponseDto;

  constructor(user: UserDto) {
    this.user = new UserResponseDto(user);
  }
}

export class UserUpdateResponseDto {
  user: UserResponseDto;

  constructor(user: UserDto) {
    this.user = new UserResponseDto(user);
  }
}