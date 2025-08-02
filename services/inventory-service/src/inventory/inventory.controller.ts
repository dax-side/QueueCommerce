import {
  Controller,
  Get,
  Post,
  Param,
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
import { InventoryService } from './inventory.service';
import { InventoryReservation } from './entities/inventory-reservation.entity';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('reservations')
  @ApiOperation({ summary: 'Get inventory reservations' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by reservation status',
    enum: ['reserved', 'confirmed', 'released', 'expired'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of inventory reservations',
    type: [InventoryReservation],
  })
  async getReservations(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ): Promise<InventoryReservation[]> {
    return this.inventoryService.getReservations(customerId, status);
  }

  @Get('reservations/:orderId')
  @ApiOperation({ summary: 'Get reservation by order ID' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory reservation details',
    type: InventoryReservation,
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async getReservation(
    @Param('orderId') orderId: string,
  ): Promise<InventoryReservation | null> {
    return this.inventoryService.getReservation(orderId);
  }

  @Post('reservations/:orderId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release inventory reservation' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation released successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async releaseReservation(@Param('orderId') orderId: string): Promise<void> {
    await this.inventoryService.releaseReservation(orderId);
  }

  @Post('reservations/:orderId/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm inventory reservation' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation confirmed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient stock or invalid reservation',
  })
  async confirmReservation(@Param('orderId') orderId: string): Promise<void> {
    await this.inventoryService.confirmReservation(orderId);
  }
}
