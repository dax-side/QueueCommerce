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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order-simple.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
    type: Order,
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    description: 'Filter orders by status',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter orders by customer ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [Order],
  })
  async findAll(
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: string,
  ): Promise<Order[]> {
    if (status) {
      return this.ordersService.findByStatus(status);
    }
    if (customerId) {
      return this.ordersService.findByCustomer(customerId);
    }
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'The order with the specified ID',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get an order by order number' })
  @ApiParam({ name: 'orderNumber', description: 'Order number' })
  @ApiResponse({
    status: 200,
    description: 'The order with the specified order number',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<Order> {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'The updated order',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 204, description: 'Order successfully deleted' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.remove(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'The cancelled order',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancel(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<Order> {
    return this.ordersService.cancelOrder(id, body.reason);
  }
}
