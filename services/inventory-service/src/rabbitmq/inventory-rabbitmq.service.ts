import { Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import {
  InventoryReservedEvent,
  InventoryInsufficientEvent,
  LowStockAlertEvent,
} from '../events/inventory-events';

@Injectable()
export class InventoryRabbitMQService {
  private readonly logger = new Logger(InventoryRabbitMQService.name);
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          this.configService.get<string>(
            'RABBITMQ_URL',
            'amqp://admin:admin123@localhost:5672',
          ),
        ],
        queue: 'inventory_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async publishEvent(pattern: string, data: any): Promise<void> {
    try {
      this.logger.log(`Publishing event: ${pattern}`);
      await this.client.emit(pattern, data).toPromise();
      this.logger.log(`Event published successfully: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${pattern}`, error);
      throw error;
    }
  }

  async sendMessage(
    pattern: string,
    data: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      this.logger.log(`Sending message: ${pattern}`);
      const response: unknown = await this.client
        .send(pattern, data)
        .toPromise();
      this.logger.log(`Message sent successfully: ${pattern}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send message: ${pattern}`, error);
      throw error;
    }
  }

  async publishInventoryReserved(event: InventoryReservedEvent): Promise<void> {
    await this.publishEvent('inventory.reserved', event);
  }

  async publishInventoryInsufficient(
    event: InventoryInsufficientEvent,
  ): Promise<void> {
    await this.publishEvent('inventory.insufficient', event);
  }

  async publishLowStockAlert(event: LowStockAlertEvent): Promise<void> {
    await this.publishEvent('inventory.low_stock_alert', event);
  }
}
