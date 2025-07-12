import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductService } from './product.service';
import { 
  CreateProductRequestDto,
  CreateProductResponseDto 
} from './dto/create-product.dto';
import { 
  UpdateProductRequestDto,
  UpdateProductResponseDto 
} from './dto/update-product.dto';
import { 
  ListProductRequestDto,
  ListProductResponseDto 
} from './dto/list-product.dto';
import { GetProductResponseDto } from './dto/get-product.dto';
import { DeleteProductResponseDto } from './dto/delete-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, type: CreateProductResponseDto })
  create(@Body() dto: CreateProductRequestDto) {
    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, type: ListProductResponseDto })
  findAll(
    @Query() query: ListProductRequestDto
  ) {
    const { page = 1, limit = 10, search } = query;
    return this.productService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, type: GetProductResponseDto })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, type: ListProductResponseDto })
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: ListProductRequestDto
  ) {
    const { page = 1, limit = 10 } = query;
    return this.productService.findByCategory(categoryId, page, limit);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, type: UpdateProductResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateProductRequestDto) {
    return this.productService.update(id, dto);
  }

  @Put(':id/stock')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update product stock status' })
  @ApiResponse({ status: 200, type: UpdateProductResponseDto })
  updateStock(
    @Param('id') id: string,
    @Body('inStock') inStock: boolean
  ) {
    return this.productService.updateStock(id, inStock);
  }

  @Put(':id/rating')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update product rating' })
  @ApiResponse({ status: 200, type: UpdateProductResponseDto })
  updateRating(
    @Param('id') id: string,
    @Body('rating') rating: number
  ) {
    return this.productService.updateRating(id, rating);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, type: DeleteProductResponseDto })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
