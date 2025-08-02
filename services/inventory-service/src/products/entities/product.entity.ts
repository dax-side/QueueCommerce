import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  collection: 'products',
})
export class Product {
  @ApiProperty({
    description: 'Unique product identifier',
    example: 'prod_456',
  })
  @Prop({ required: true, unique: true, index: true })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Headphones',
  })
  @Prop({ required: true, index: true })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless headphones with noise cancellation',
  })
  @Prop({ required: true })
  description: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
  })
  @Prop({ required: true, index: true })
  category: string;

  @ApiProperty({
    description: 'Product price in dollars',
    example: 99.99,
  })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({
    description: 'Available stock quantity',
    example: 50,
  })
  @Prop({ required: true, min: 0, index: true })
  stockQuantity: number;

  @ApiProperty({
    description: 'Reserved stock quantity (for pending orders)',
    example: 5,
  })
  @Prop({ default: 0, min: 0 })
  reservedQuantity: number;

  @ApiProperty({
    description: 'Minimum stock level threshold',
    example: 10,
  })
  @Prop({ default: 0, min: 0 })
  lowStockThreshold: number;

  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit)',
    example: 'WH-001-BLK',
  })
  @Prop({ required: true, unique: true, index: true })
  sku: string;

  @ApiProperty({
    description: 'Product weight in kg',
    example: 0.5,
  })
  @Prop({ min: 0 })
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions (L x W x H) in cm',
    example: '20x15x8',
  })
  @Prop()
  dimensions?: string;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  @Prop({ default: true, index: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Product creation timestamp',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Product last update timestamp',
  })
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add compound indexes for better query performance
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ stockQuantity: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' }); // Full-text search

// Calculate available quantity dynamically
ProductSchema.virtual('availableQuantity').get(function () {
  return this.stockQuantity - this.reservedQuantity;
});

// Check if product is in stock
ProductSchema.virtual('inStock').get(function () {
  return this.stockQuantity - this.reservedQuantity > 0;
});

// Check if stock is low
ProductSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.lowStockThreshold;
});
