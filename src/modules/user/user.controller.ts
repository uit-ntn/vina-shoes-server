import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto, UserResponseDto, UserDetailResponseDto } from './user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserDetailResponseDto })
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserDetailResponseDto({
      id: user.id,
      ...user
    });
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, type: UserDetailResponseDto })
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const updated = await this.userService.update(req.user.userId, updateUserDto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return new UserDetailResponseDto({
      id: updated.id,
      ...updated
    });
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.userService.findAll(page, limit, search);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserDetailResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new UserDetailResponseDto({
      id: user.id,
      ...user
    });
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
