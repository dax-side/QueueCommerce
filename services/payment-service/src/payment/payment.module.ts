import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { PaymentEventPublisherService } from '../events/payment-event-publisher.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentEventPublisherService, RabbitMQService],
  exports: [PaymentService, PaymentEventPublisherService, RabbitMQService],
})
export class PaymentModule {}
