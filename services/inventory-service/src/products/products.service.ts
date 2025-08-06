import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto } from '../inventory/dto/inventory.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.log(`Creating new product: ${createProductDto.productId}`);

    // Check if product already exists
    const existingProduct = await this.productModel.findOne({
      $or: [
        { productId: createProductDto.productId },
        { sku: createProductDto.sku },
      ],
    });

    if (existingProduct) {
      throw new BadRequestException(
        `Product with ID ${createProductDto.productId} or SKU ${createProductDto.sku} already exists`,
      );
    }

    const productData = {
      ...createProductDto,
      lowStockThreshold: createProductDto.lowStockThreshold || 10,
      isActive:
        createProductDto.isActive !== undefined
          ? createProductDto.isActive
          : true,
    };

    const createdProduct = new this.productModel(productData);
    const savedProduct = await createdProduct.save();

    this.logger.log(`Product created successfully: ${savedProduct.productId}`);
    return savedProduct;
  }

  async findAll(
    category?: string,
    isActive?: boolean,
    inStock?: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;
    if (inStock) {
      filter.$expr = {
        $gt: [{ $subtract: ['$stockQuantity', '$reservedQuantity'] }, 0],
      };
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByProductId(productId: string): Promise<Product> {
    const product = await this.productModel.findOne({ productId }).exec();
    if (!product) {
      throw new NotFoundException(
        `Product with productId ${productId} not found`,
      );
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    this.logger.log(`Updating product: ${id}`);

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log(
      `Product updated successfully: ${updatedProduct.productId}`,
    );
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing product: ${id}`);

    const result = await this.productModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.logger.log(`Product removed successfully: ${id}`);
  }

  async updateStock(updateStockDto: UpdateStockDto): Promise<Product> {
    this.logger.log(
      `Updating stock for product: ${updateStockDto.productId} to ${updateStockDto.quantity}`,
    );

    const product = await this.productModel
      .findOne({ productId: updateStockDto.productId })
      .exec();
    if (!product) {
      throw new NotFoundException(
        `Product with ID ${updateStockDto.productId} not found`,
      );
    }

    const oldStock = product.stockQuantity;
    product.stockQuantity = updateStockDto.quantity;
    const updatedProduct = await product.save();

    this.logger.log(
      `Stock updated: ${updateStockDto.productId} (${oldStock} → ${updateStockDto.quantity})`,
    );

    // Check if stock is now low and send alert
    this.checkAndSendLowStockAlert(updatedProduct);

    return updatedProduct;
  }

  async adjustStock(
    productId: string,
    adjustment: number,
    reason: string,
  ): Promise<Product> {
    this.logger.log(
      `Adjusting stock for product: ${productId} by ${adjustment} (${reason})`,
    );

    const product = await this.productModel.findOne({ productId }).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.stockQuantity + adjustment < 0) {
      throw new BadRequestException(
        `Cannot adjust stock: would result in negative stock (current: ${product.stockQuantity}, adjustment: ${adjustment})`,
      );
    }

    const oldStock = product.stockQuantity;
    product.stockQuantity += adjustment;
    const updatedProduct = await product.save();

    this.logger.log(
      `Stock adjusted: ${productId} (${oldStock} → ${product.stockQuantity})`,
    );

    // Check if stock is now low and send alert
    this.checkAndSendLowStockAlert(updatedProduct);

    return updatedProduct;
  }

  async getAvailableQuantity(productId: string): Promise<number> {
    const product = await this.productModel.findOne({ productId }).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return product.stockQuantity - product.reservedQuantity;
  }

  async searchProducts(
    searchTerm: string,
    limit: number = 10,
  ): Promise<Product[]> {
    return this.productModel
      .find(
        {
          $text: { $search: searchTerm },
          isActive: true,
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .exec();
  }

  private checkAndSendLowStockAlert(product: Product): void {
    if (
      product.stockQuantity <= product.lowStockThreshold &&
      product.isActive
    ) {
      this.logger.warn(
        `Low stock alert for product: ${product.productId} (${product.stockQuantity} remaining)`,
      );

      // Note: Low stock alerting can be implemented via a separate event publisher
      // or integrated with the inventory service's event system
    }
  }
}
