import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getInfo() {
    return {
      name: 'QueueCommerce API Gateway',
      version: '1.0.0',
      description: 'API Gateway for QueueCommerce microservices platform',
      author: 'Damola Adegbite',
      license: 'PolyForm-Noncommercial-1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      documentation: '/api/docs',
      endpoints: {
        health: '/health',
        auth: '/api/v1/auth',
        services: '/api/v1/services/{serviceName}',
      },
    };
  }

  getStatus() {
    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }
}
