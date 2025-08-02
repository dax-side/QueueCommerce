import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  ValidateNested,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product identifier',
    example: 'prod_456',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
  })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({
    description: 'Quantity of items',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Unit price in dollars',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({
    description:
      'Total price for this line item (calculated automatically if not provided)',
    example: 199.98,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;
}

export class CreateShippingAddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateCustomerInfoDto {
  @ApiProperty({
    description: 'Unique customer identifier',
    example: 'cust_123456789',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    description:
      'Unique order number (generated automatically if not provided)',
    example: 'ORD-2025-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  orderNumber?: string;

  @ApiProperty({
    description: 'Customer information',
    type: CreateCustomerInfoDto,
  })
  @ValidateNested()
  @Type(() => CreateCustomerInfoDto)
  customer: CreateCustomerInfoDto;

  @ApiProperty({
    description: 'Array of order items',
    type: [CreateOrderItemDto],
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiPropertyOptional({
    description:
      'Subtotal before tax and shipping (calculated automatically if not provided)',
    example: 199.98,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @ApiPropertyOptional({
    description: 'Tax amount (calculated automatically if not provided)',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({
    description: 'Shipping cost (calculated automatically if not provided)',
    example: 9.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional({
    description:
      'Total order amount (calculated automatically if not provided)',
    example: 229.97,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @ApiProperty({
    description: 'Shipping address',
    type: CreateShippingAddressDto,
  })
  @ValidateNested()
  @Type(() => CreateShippingAddressDto)
  shippingAddress: CreateShippingAddressDto;

  @ApiProperty({
    description: 'Payment method',
    example: 'credit_card',
    enum: [
      'credit_card',
      'debit_card',
      'paypal',
      'apple_pay',
      'google_pay',
      'bank_transfer',
    ],
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Please deliver during business hours',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
