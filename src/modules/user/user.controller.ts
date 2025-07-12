import { Controller, Get, Put, Delete, Query, Param, Body, UseGuards, Request, NotFoundException, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { ListUserRequestDto, ListUserResponseDto } from './dto/list-user.dto';
import { 
  UpdateUserRequestDto, 
  UpdateUserResponseDto 
} from './dto/update-user.dto';
import { UserStatsResponseDto } from './dto/user-stats.dto';
import { 
  UpdateUserStatusRequestDto, 
  UpdateUserStatusResponseDto 
} from './dto/update-user-status.dto';
import {
  UpdateUserRoleRequestDto,
  UpdateUserRoleResponseDto
} from './dto/update-user-role.dto';
import {
  CreateUserRequestDto,
  CreateUserResponseDto
} from './dto/create-user.dto';
import { UserBaseDto } from './dto/user-base.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiResponse({ status: 200, type: ListUserResponseDto })
  @Get()
  findAll(@Query() query: ListUserRequestDto) {
    return this.userService.findAll(query);
  }

  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, type: UserStatsResponseDto })
  @Get('stats')
  getStats() {
    return this.userService.getStats();
  }

  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({ status: 200, type: [UserBaseDto] })
  @Get('search')
  searchUsers(@Query('q') query: string) {
    return this.userService.searchUsers(query);
  }

  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: CreateUserResponseDto })
  @Post()
  create(@Body() dto: CreateUserRequestDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UpdateUserResponseDto })
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, type: UpdateUserResponseDto })
  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserRequestDto
  ) {
    const updated = await this.userService.update(req.user.userId, updateUserDto);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return { user: updated };
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: ListUserResponseDto })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user };
  }

  @ApiOperation({ summary: 'Delete user' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @ApiOperation({ summary: 'Update user status' })
  @ApiResponse({ status: 200, type: UpdateUserStatusResponseDto })
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusRequestDto
  ) {
    return this.userService.updateStatus(id, dto);
  }

  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, type: UpdateUserRoleResponseDto })
  @Put(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleRequestDto
  ) {
    return this.userService.updateRole(id, dto);
  }
}
