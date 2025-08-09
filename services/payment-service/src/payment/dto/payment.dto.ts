import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  productName: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit price in cents' })
  @IsNumber()
  unitPrice: number;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Amount in cents' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Payment Intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Payment Method ID from Stripe' })
  @IsString()
  paymentMethodId: string;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Payment Intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Refund amount in cents', required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ description: 'Refund reason', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
