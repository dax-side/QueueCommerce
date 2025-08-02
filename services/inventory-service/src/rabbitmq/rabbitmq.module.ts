import { Module } from '@nestjs/common';
import { InventoryRabbitMQService } from './inventory-rabbitmq.service';

@Module({
  providers: [InventoryRabbitMQService],
  exports: [InventoryRabbitMQService],
})
export class RabbitMQModule {}
