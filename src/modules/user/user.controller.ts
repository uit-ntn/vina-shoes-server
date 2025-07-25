import { Controller, Get, Put, Delete, Query, Param, Body, UseGuards, Request, NotFoundException, Post, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { ListUserResponseDto } from './dto/list-user.dto';
import { 
  UpdateUserRequestDto, 
  UpdateUserResponseDto 
} from './dto/update-user.dto';

import {
  CreateUserRequestDto,
  CreateUserResponseDto
} from './dto/create-user.dto';
import { UserBaseDto } from './dto/user-base.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath
} from '@nestjs/swagger';
import {
  SoftDeleteUserResponseDto,
  RestoreUserResponseDto
} from './dto/soft-delete-user.dto';
import { UpdateLastLoginResponseDto } from './dto/last-login.dto';
import { FindDeletedUsersResponseDto } from './dto/find-deleted-users.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'List of all users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'user'] },
          status: { type: 'string', enum: ['active', 'inactive', 'banned'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @Get()
  findAll() {
    return this.userService.findAll();
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


  


  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Name' },
        email: { type: 'string', example: 'updated@example.com' }
      }
    }
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        message: { type: 'string', example: 'User updated successfully' }
      }
    }
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserRequestDto
  ) {
    const user = await this.userService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { 
      user, 
      message: 'User updated successfully' 
    };
  }

  @ApiOperation({ summary: 'Find all soft-deleted users' })
  @ApiOkResponse({
    description: 'List of soft-deleted users',
    type: FindDeletedUsersResponseDto
  })
  @Get('deleted')
  async findDeleted() {
    const users = await this.userService.findDeleted();
    return { users };
  }

  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User soft deleted',
    type: SoftDeleteUserResponseDto
  })
  @Patch(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.userService.softDelete(id);
  }

  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'User restored',
    type: RestoreUserResponseDto
  })
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.userService.restore(id);
  }

  @ApiOperation({ summary: 'Update last login time' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOkResponse({
    description: 'Last login time updated',
    type: UpdateLastLoginResponseDto
  })
  @Patch(':id/last-login')
  async updateLastLogin(@Param('id') id: string) {
    return this.userService.updateLastLogin(id);
  }
}

