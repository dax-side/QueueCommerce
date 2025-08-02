import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventPattern } from '@nestjs/microservices';
import {
  InventoryReservation,
  InventoryReservationDocument,
  ReservationStatus,
} from './entities/inventory-reservation.entity';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { InventoryRabbitMQService } from '../rabbitmq/inventory-rabbitmq.service';
import {
  InventoryReservedEvent,
  InventoryInsufficientEvent,
} from '../events/inventory-events';

export interface InventoryReservationRequest {
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(InventoryReservation.name)
    private reservationModel: Model<InventoryReservationDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private readonly rabbitMQService: InventoryRabbitMQService,
  ) {}

  @EventPattern('inventory.reservation.requested')
  async handleInventoryReservationRequest(
    data: InventoryReservationRequest,
  ): Promise<void> {
    this.logger.log(
      `🔄 Processing inventory reservation request for order: ${data.orderId}`,
    );

    try {
      // Check availability for all items
      const reservationResults = await this.checkAndReserveInventory(data);

      if (reservationResults.success) {
        // All items can be reserved
        await this.createReservation(data, reservationResults.reservedItems);

        const inventoryReservedEvent = new InventoryReservedEvent(
          data.orderId,
          'reservation_' + Date.now(),
          data.customerId,
          reservationResults.reservedItems,
          new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        );

        await this.rabbitMQService.publishInventoryReserved(
          inventoryReservedEvent,
        );

        this.logger.log(
          `✅ Inventory reserved successfully for order: ${data.orderId}`,
        );
      } else {
        // Some items cannot be reserved
        const inventoryInsufficientEvent = new InventoryInsufficientEvent(
          data.orderId,
          data.customerId,
          reservationResults.insufficientItems,
          reservationResults.availableItems
            .map((item) => item.productId)
            .join(','),
        );

        await this.rabbitMQService.publishInventoryInsufficient(
          inventoryInsufficientEvent,
        );

        this.logger.warn(
          `⚠️ Insufficient inventory for order: ${data.orderId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Error processing inventory reservation for order ${data.orderId}:`,
        error,
      );

      // Send insufficient inventory event on error
      const inventoryInsufficientEvent = new InventoryInsufficientEvent(
        data.orderId,
        data.customerId,
        data.items.map((item) => ({
          productId: item.productId,
          productName: 'Unknown Product',
          requestedQuantity: item.quantity,
          availableQuantity: 0,
        })),
        'Error processing reservation',
      );

      await this.rabbitMQService.publishInventoryInsufficient(
        inventoryInsufficientEvent,
      );
    }
  }

  private async checkAndReserveInventory(
    data: InventoryReservationRequest,
  ): Promise<{
    success: boolean;
    reservedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      reservedQuantity: number;
    }>;
    insufficientItems: Array<{
      productId: string;
      productName: string;
      requestedQuantity: number;
      availableQuantity: number;
    }>;
    availableItems: Array<{
      productId: string;
      availableQuantity: number;
    }>;
  }> {
    const reservedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      reservedQuantity: number;
    }> = [];
    const insufficientItems: Array<{
      productId: string;
      productName: string;
      requestedQuantity: number;
      availableQuantity: number;
    }> = [];
    const availableItems: Array<{
      productId: string;
      availableQuantity: number;
    }> = [];

    for (const item of data.items) {
      const product = await this.productModel
        .findOne({ productId: item.productId })
        .exec();

      if (!product) {
        insufficientItems.push({
          productId: item.productId,
          productName: 'Unknown Product',
          requestedQuantity: item.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      if (!product.isActive) {
        insufficientItems.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      const availableQuantity =
        product.stockQuantity - product.reservedQuantity;

      availableItems.push({
        productId: item.productId,
        availableQuantity,
      });

      if (availableQuantity >= item.quantity) {
        // Reserve the inventory
        product.reservedQuantity += item.quantity;
        await product.save();

        reservedItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          reservedQuantity: item.quantity,
        });

        this.logger.log(
          `📦 Reserved ${item.quantity} units of ${item.productId} (${availableQuantity} available)`,
        );
      } else {
        insufficientItems.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity,
        });
      }
    }

    return {
      success: insufficientItems.length === 0,
      reservedItems,
      insufficientItems,
      availableItems,
    };
  }

  private async createReservation(
    data: InventoryReservationRequest,
    reservedItems: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      reservedQuantity: number;
    }>,
  ): Promise<InventoryReservation> {
    const reservation = new this.reservationModel({
      reservationId: 'res_' + Date.now(),
      orderId: data.orderId,
      customerId: data.customerId,
      items: reservedItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      status: ReservationStatus.PENDING,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    return reservation.save();
  }

  async releaseReservation(orderId: string): Promise<void> {
    this.logger.log(`🔓 Releasing inventory reservation for order: ${orderId}`);

    const reservation = await this.reservationModel
      .findOne({ orderId, status: ReservationStatus.PENDING })
      .exec();

    if (!reservation) {
      throw new NotFoundException(
        `No active reservation found for order: ${orderId}`,
      );
    }

    // Release reserved quantities
    for (const item of reservation.items) {
      const product = await this.productModel
        .findOne({ productId: item.productId })
        .exec();

      if (product) {
        product.reservedQuantity = Math.max(
          0,
          product.reservedQuantity - item.quantity,
        );
        await product.save();
      }
    }

    // Update reservation status
    reservation.status = ReservationStatus.RELEASED;
    await reservation.save();

    this.logger.log(`✅ Inventory reservation released for order: ${orderId}`);
  }

  async confirmReservation(orderId: string): Promise<void> {
    this.logger.log(
      `✅ Confirming inventory reservation for order: ${orderId}`,
    );

    const reservation = await this.reservationModel
      .findOne({ orderId, status: ReservationStatus.PENDING })
      .exec();

    if (!reservation) {
      throw new NotFoundException(
        `No active reservation found for order: ${orderId}`,
      );
    }

    // Reduce actual stock quantities
    for (const item of reservation.items) {
      const product = await this.productModel
        .findOne({ productId: item.productId })
        .exec();

      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${item.productId}`,
        );
      }

      product.stockQuantity -= item.quantity;
      product.reservedQuantity = Math.max(
        0,
        product.reservedQuantity - item.quantity,
      );
      await product.save();
    }

    // Update reservation status
    reservation.status = ReservationStatus.CONFIRMED;
    await reservation.save();

    this.logger.log(`✅ Inventory reservation confirmed for order: ${orderId}`);
  }

  async getReservation(orderId: string): Promise<InventoryReservation | null> {
    return this.reservationModel.findOne({ orderId }).exec();
  }

  async getReservations(
    customerId?: string,
    status?: string,
  ): Promise<InventoryReservation[]> {
    const filter: Record<string, any> = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    return this.reservationModel.find(filter).exec();
  }
}
