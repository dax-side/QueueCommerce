import { Injectable, Logger } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
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

  async sendMessage(pattern: string, data: any): Promise<any> {
    try {
      this.logger.log(`Sending message: ${pattern}`);
      const result = await this.client.send(pattern, data).toPromise();
      this.logger.log(`Message sent successfully: ${pattern}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send message: ${pattern}`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
