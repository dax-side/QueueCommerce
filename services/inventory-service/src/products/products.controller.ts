import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: Product,
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filter by stock availability',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products with pagination',
  })
  async findAll(
    @Query('category') category?: string,
    @Query('isActive') isActive?: boolean,
    @Query('inStock') inStock?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.productsService.findAll(
      category,
      isActive,
      inStock,
      page,
      limit,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'q', description: 'Search term' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum results',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [Product],
  })
  async search(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ): Promise<Product[]> {
    return this.productsService.searchProducts(searchTerm, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Get('by-product-id/:productId')
  @ApiOperation({ summary: 'Get product by product ID' })
  @ApiParam({ name: 'productId', description: 'Product identifier' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<Product> {
    return this.productsService.findByProductId(productId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Get(':productId/available-quantity')
  @ApiOperation({ summary: 'Get available quantity for product' })
  @ApiParam({ name: 'productId', description: 'Product identifier' })
  @ApiResponse({
    status: 200,
    description: 'Available quantity',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async getAvailableQuantity(
    @Param('productId') productId: string,
  ): Promise<{ availableQuantity: number }> {
    const quantity = await this.productsService.getAvailableQuantity(productId);
    return { availableQuantity: quantity };
  }
}
