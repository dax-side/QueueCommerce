import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import {
  PaymentIntentCreatedEvent,
  PaymentSucceededEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
} from './payment-events';

@Injectable()
export class PaymentEventPublisherService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'payment_events_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async publishPaymentIntentCreated(event: PaymentIntentCreatedEvent) {
    try {
      console.log('Publishing PaymentIntentCreated event:', event);
      await this.client.emit('payment.intent.created', event);
    } catch (error) {
      console.error('Error publishing PaymentIntentCreated event:', error);
    }
  }

  async publishPaymentSucceeded(event: PaymentSucceededEvent) {
    try {
      console.log('Publishing PaymentSucceeded event:', event);
      await this.client.emit('payment.succeeded', event);
    } catch (error) {
      console.error('Error publishing PaymentSucceeded event:', error);
    }
  }

  async publishPaymentFailed(event: PaymentFailedEvent) {
    try {
      console.log('Publishing PaymentFailed event:', event);
      await this.client.emit('payment.failed', event);
    } catch (error) {
      console.error('Error publishing PaymentFailed event:', error);
    }
  }

  async publishPaymentRefunded(event: PaymentRefundedEvent) {
    try {
      console.log('Publishing PaymentRefunded event:', event);
      await this.client.emit('payment.refunded', event);
    } catch (error) {
      console.error('Error publishing PaymentRefunded event:', error);
    }
  }

  onModuleDestroy() {
    this.client.close();
  }
}
