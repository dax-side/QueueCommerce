import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    description: 'Product ID to update stock for',
    example: 'prod_wireless_headphones_001',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'New stock quantity',
    example: 150,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Reason for stock update',
    example: 'New shipment received',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ReserveInventoryDto {
  @ApiProperty({
    description: 'Order ID requesting the reservation',
    example: '688df36610abad9428bcc893',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Customer ID from the order',
    example: 'cust_123456789',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Product ID to reserve',
    example: 'prod_wireless_headphones_001',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity to reserve',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class ReleaseReservationDto {
  @ApiProperty({
    description: 'Reservation ID to release',
    example: 'res_123456789',
  })
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({
    description: 'Reason for releasing the reservation',
    example: 'Order cancelled by customer',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
