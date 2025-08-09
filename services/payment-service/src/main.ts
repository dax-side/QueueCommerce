import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body parsing for Stripe webhooks
  });

  // Enable CORS for frontend integration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend URLs
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Payment Service API')
    .setDescription(
      'Stripe-based payment processing microservice for QueueCommerce',
    )
    .setVersion('1.0')
    .addTag('payments')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Connect microservice for event-driven communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
      ],
      queue: 'inventory_queue', // Use same queue as inventory service for event sharing
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
  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`Payment Service is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
  console.log(
    `RabbitMQ Queue: ${process.env.RABBITMQ_QUEUE || 'payment_queue'}`,
  );
}

bootstrap().catch((error) =>
  console.error('Error starting Payment Service:', error),
);
