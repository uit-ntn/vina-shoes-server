import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({ 
    type: CreateProductRequestDto,
    description: 'Product data to create'
  })
  @ApiCreatedResponse({
    description: 'Product successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
        name: { type: 'string', example: 'Nike Air Max' },
        slug: { type: 'string', example: 'nike-air-max' },
        price: { type: 'number', example: 199.99 },
        message: { type: 'string', example: 'Product created successfully' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  create(@Body() dto: CreateProductRequestDto) {
    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term', type: String })
  @ApiOkResponse({
    description: 'List of products returned',
    type: [GetProductResponseDto]
  })
  findAll(@Query('search') search?: string) {
    return this.productService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({ 
    description: 'Product details',
    type: GetProductResponseDto 
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }



  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductRequestDto })
  @ApiOkResponse({ 
    description: 'Product successfully updated',
    type: UpdateProductResponseDto 
  })
  update(@Param('id') id: string, @Body() dto: UpdateProductRequestDto) {
    return this.productService.update(id, dto);
  }



  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiOkResponse({ 
    description: 'Product successfully deleted',
    type: DeleteProductResponseDto 
  })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }



  @Get('new-arrivals')
  @ApiOperation({ summary: 'Get new arrival products' })
  @ApiOkResponse({
    description: 'New arrival products returned successfully',
    type: [GetProductResponseDto]
  })
  getNewArrivals() {
    return this.productService.getNewArrivals();
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best selling products' })
  @ApiOkResponse({
    description: 'Best selling products returned successfully',
    type: [GetProductResponseDto]
  })
  getBestSellers() {
    return this.productService.getBestSellers();
  }

  @Get('brand/:brand')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiParam({ name: 'brand', description: 'Brand name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Products by brand returned successfully',
    type: ListProductResponseDto
  })
  getByBrand(
    @Param('brand') brand: string,
    @Query() query: ListProductRequestDto
  ) {
    const { page = 1, limit = 10 } = query;
    return this.productService.getByBrand(brand, page, limit);
  }
}
