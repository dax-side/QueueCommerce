import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Public()
  @Get('ready')
  async getReadiness() {
    const isHealthy = await this.healthService.isHealthy();

    if (isHealthy) {
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } else {
      throw new Error('Service is not ready');
    }
  }

  @Public()
  @Get('live')
  getLiveness() {
    // Simple liveness check - if we can respond, we're alive
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
