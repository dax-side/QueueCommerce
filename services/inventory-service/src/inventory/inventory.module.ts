import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import {
  InventoryReservation,
  InventoryReservationSchema,
} from './entities/inventory-reservation.entity';
import { ProductsModule } from '../products/products.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: InventoryReservation.name,
        schema: InventoryReservationSchema,
      },
    ]),
    ProductsModule,
    RabbitMQModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
