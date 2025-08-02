import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type InventoryReservationDocument = InventoryReservation & Document;

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RELEASED = 'released',
  EXPIRED = 'expired',
}

@Schema({
  timestamps: true,
  collection: 'inventory_reservations',
})
export class InventoryReservation {
  @ApiProperty({
    description: 'Unique reservation identifier',
    example: 'res_123456789',
  })
  @Prop({ required: true, unique: true, index: true })
  reservationId: string;

  @ApiProperty({
    description: 'Order ID that requested this reservation',
    example: '688df36610abad9428bcc893',
  })
  @Prop({ required: true, index: true })
  orderId: string;

  @ApiProperty({
    description: 'Reserved items',
    type: [Object],
    example: [
      {
        productId: 'prod_123',
        productName: 'Wireless Headphones',
        quantity: 2,
        unitPrice: 99.99,
      },
    ],
  })
  @Prop({
    required: true,
    type: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],
  })
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;

  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @Prop({
    required: true,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
    index: true,
  })
  status: ReservationStatus;

  @ApiProperty({
    description: 'When the reservation expires',
    example: '2025-08-02T13:00:00.000Z',
  })
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty({
    description: 'Customer ID from the order',
    example: 'cust_123456789',
  })
  @Prop({ required: true, index: true })
  customerId: string;

  @ApiProperty({
    description: 'Reason for status change',
    example: 'Order cancelled by customer',
  })
  @Prop()
  statusReason?: string;

  @ApiProperty({
    description: 'Reservation creation timestamp',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Reservation last update timestamp',
  })
  updatedAt?: Date;
}

export const InventoryReservationSchema =
  SchemaFactory.createForClass(InventoryReservation);

// Add compound indexes for efficient queries
InventoryReservationSchema.index({ orderId: 1, productId: 1 });
InventoryReservationSchema.index({ status: 1, expiresAt: 1 });
InventoryReservationSchema.index({ customerId: 1, status: 1 });

// TTL index to automatically clean up expired reservations
InventoryReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
