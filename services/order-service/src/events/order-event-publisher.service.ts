import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderCancelledEvent,
  InventoryReservationRequestedEvent,
  PaymentProcessingRequestedEvent,
} from '../events/order-events';

@Injectable()
export class OrderEventPublisher {
  private readonly logger = new Logger(OrderEventPublisher.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    this.logger.log(
      `Publishing OrderCreated event for order: ${event.orderNumber}`,
    );
    await this.rabbitMQService.publishEvent('order.created', event);

    // Also trigger downstream processes
    await this.requestInventoryReservation(
      new InventoryReservationRequestedEvent(
        event.orderId,
        event.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      ),
    );

    await this.requestPaymentProcessing(
      new PaymentProcessingRequestedEvent(
        event.orderId,
        event.customerId,
        event.total,
        'credit_card', // This would come from the order data
      ),
    );
  }

  async publishOrderUpdated(event: OrderUpdatedEvent): Promise<void> {
    this.logger.log(
      `Publishing OrderUpdated event for order: ${event.orderNumber}`,
    );
    await this.rabbitMQService.publishEvent('order.updated', event);
  }

  async publishOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    this.logger.log(
      `Publishing OrderCancelled event for order: ${event.orderNumber}`,
    );
    await this.rabbitMQService.publishEvent('order.cancelled', event);
  }

  private async requestInventoryReservation(
    event: InventoryReservationRequestedEvent,
  ): Promise<void> {
    this.logger.log(
      `Requesting inventory reservation for order: ${event.orderId}`,
    );
    await this.rabbitMQService.publishEvent(
      'inventory.reservation.requested',
      event,
    );
  }

  private async requestPaymentProcessing(
    event: PaymentProcessingRequestedEvent,
  ): Promise<void> {
    this.logger.log(
      `Requesting payment processing for order: ${event.orderId}`,
    );
    await this.rabbitMQService.publishEvent(
      'payment.processing.requested',
      event,
    );
  }
}
