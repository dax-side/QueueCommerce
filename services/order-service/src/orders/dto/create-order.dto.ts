import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  MinLength,
  MaxLength,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product identifier',
    example: 'prod_123456',
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
  @MinLength(1)
  @MaxLength(100)
  productName: string;

  @ApiProperty({
    description: 'Quantity of items',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Unit price in cents',
    example: 2999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateShippingAddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'NY',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  country: string;
}

export class CreateCustomerInfoDto {
  @ApiProperty({
    description: 'Unique customer identifier',
    example: 'cust_123456789',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  customerId: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Customer first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;
}

export class CreateOrderDto {
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
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

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
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  paymentMethod: string;

  @ApiPropertyOptional({
    description: 'Order notes',
    example: 'Please deliver during business hours',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
