import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create HTTP application
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors();

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('BuzzMall Inventory Service')
    .setDescription(
      'Inventory and product management API for BuzzMall e-commerce platform',
    )
    .setVersion('1.0')
    .addTag('products', 'Product catalog management')
    .addTag('inventory', 'Inventory reservations and stock management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Create microservice for RabbitMQ events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
      ],
      queue: 'inventory_queue',
      queueOptions: {
        durable: true,
      },
      // Use the default exchange for event patterns
      noAck: false,
      prefetchCount: 1,
    },
  });

  // Start both HTTP server and microservice
  await app.startAllMicroservices();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Inventory Service is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(
    `🐰 RabbitMQ URL: ${process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672'}`,
  );
  console.log(
    `📦 MongoDB URL: ${process.env.DATABASE_URL ? 'Connected to Atlas' : 'localhost:27017'}`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Error starting Inventory Service:', error);
  process.exit(1);
});
