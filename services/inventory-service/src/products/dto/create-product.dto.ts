import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 'prod_wireless_headphones_001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Noise-Cancelling Headphones',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example:
      'Premium wireless headphones with active noise cancellation and 30-hour battery life',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Product price in dollars',
    example: 299.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Initial stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({
    description: 'Low stock threshold (default: 10)',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'WH-NC-001-BLK',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  sku: string;

  @ApiPropertyOptional({
    description: 'Product weight in kg',
    example: 0.45,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions (L x W x H) in cm',
    example: '20x18x8',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Whether the product is active (default: true)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
