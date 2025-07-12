import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';
import { CreateCategoryRequestDto, CreateCategoryResponseDto } from './dto/create-category.dto';
import { UpdateCategoryRequestDto, UpdateCategoryResponseDto } from './dto/update-category.dto';
import { DeleteCategoryResponseDto } from './dto/delete-category.dto';
import { ListCategoryRequestDto, ListCategoryResponseDto } from './dto/list-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CreateCategoryRequestDto })
  @ApiCreatedResponse({ 
    description: 'Category created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '686e552a77dce804acca23b1' },
        name: { type: 'string', example: 'Sneakers' },
        slug: { type: 'string', example: 'sneakers' },
        message: { type: 'string', example: 'Category created successfully' }
      }
    }
  })
  async create(@Body() dto: CreateCategoryRequestDto) {
    const category = await this.categoryService.create(dto);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      message: 'Category created successfully'
    };
  }
  
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiOkResponse({
    description: 'List of categories',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '686e552a77dce804acca23b1' },
              name: { type: 'string', example: 'Sneakers' },
              slug: { type: 'string', example: 'sneakers' }
            }
          }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  async findAll(@Query() query: ListCategoryRequestDto) {
    const { page = 1, limit = 10, search } = query;
    return this.categoryService.findAll(page, limit, search);
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '686e552a77dce804acca23b1' },
        name: { type: 'string', example: 'Sneakers' },
        slug: { type: 'string', example: 'sneakers' }
      }
    }
  })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
  
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiOkResponse({
    description: 'Category details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '686e552a77dce804acca23b1' },
        name: { type: 'string', example: 'Sneakers' },
        slug: { type: 'string', example: 'sneakers' }
      }
    }
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }
  
  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryRequestDto })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: UpdateCategoryResponseDto
  })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryRequestDto) {
    await this.categoryService.update(id, dto);
    return {
      id,
      message: 'Category updated successfully'
    };
  }
  
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    type: DeleteCategoryResponseDto
  })
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}