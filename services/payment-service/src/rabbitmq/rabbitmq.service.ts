import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: process.env.RABBITMQ_QUEUE || 'payment_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async publishEvent(pattern: string, data: any): Promise<void> {
    try {
      console.log(`Publishing event with pattern: ${pattern}`, data);
      this.client.emit(pattern, data);
    } catch (error) {
      console.error(`Error publishing event with pattern ${pattern}:`, error);
      throw error;
    }
  }

  async sendMessage(pattern: string, data: any): Promise<any> {
    try {
      console.log(`Sending message with pattern: ${pattern}`, data);

      return await this.client.send(pattern, data).toPromise();
    } catch (error) {
      console.error(`Error sending message with pattern ${pattern}:`, error);
      throw error;
    }
  }

  onModuleDestroy() {
    this.client.close();
  }
}
