import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './entities/order.entity';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { OrderEventPublisher } from '../events/order-event-publisher.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    RabbitMQModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderEventPublisher],
  exports: [OrdersService],
})
export class OrdersModule {}
