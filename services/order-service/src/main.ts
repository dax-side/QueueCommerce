import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('OrderServiceBootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('QueueCommerce Order Service')
      .setDescription(
        'The Order Service API for QueueCommerce platform with Event-Driven Architecture',
      )
      .setVersion('1.0')
      .addTag('orders', 'Order management operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT ?? 3000;
    await app.listen(port);

    logger.log(`🚀 Order Service is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
    logger.log(`🐰 RabbitMQ URL: ${process.env.RABBITMQ_URL}`);
    logger.log(
      ` MongoDB URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`,
    );
  } catch (error) {
    logger.error('❌ Failed to start Order Service', error);
    process.exit(1);
  }
}
void bootstrap();
