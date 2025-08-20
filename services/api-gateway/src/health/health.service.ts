import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ProxyService } from '../proxy/proxy.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  services: Record<
    string,
    {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    }
  >;
  system: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const services = await this.checkAllServices();
    const systemInfo = this.getSystemInfo();

    // Determine overall status
    const healthyServices = Object.values(services).filter(
      (service) => service.status === 'healthy',
    ).length;
    const totalServices = Object.keys(services).length;

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (healthyServices === 0) {
      status = 'unhealthy';
    } else if (healthyServices < totalServices) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      services,
      system: systemInfo,
    };
  }

  private async checkAllServices(): Promise<HealthStatus['services']> {
    const serviceUrls = this.proxyService.getServiceUrls();
    const serviceChecks: Record<
      string,
      Promise<{
        status: 'healthy' | 'unhealthy';
        responseTime?: number;
        error?: string;
      }>
    > = {};

    // Start all health checks concurrently
    for (const [serviceName] of Object.entries(serviceUrls)) {
      serviceChecks[serviceName] = this.checkSingleService(serviceName);
    }

    // Wait for all checks to complete
    const results: HealthStatus['services'] = {};

    for (const [serviceName, checkPromise] of Object.entries(serviceChecks)) {
      try {
        const result = await checkPromise;
        results[serviceName] = result as HealthStatus['services'][string];
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        results[serviceName] = {
          status: 'unhealthy',
          error: errorMessage,
        };
      }
    }

    return results;
  }

  private async checkSingleService(serviceName: string): Promise<{
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const isHealthy = await this.proxyService.checkServiceHealth(serviceName);
      const responseTime = Date.now() - startTime;

      if (isHealthy) {
        return {
          status: 'healthy',
          responseTime,
        };
      } else {
        return {
          status: 'unhealthy',
          responseTime,
          error: 'Service health check failed',
        };
      }
    } catch (error: unknown) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'unhealthy',
        responseTime,
        error: errorMessage,
      };
    }
  }

  private getSystemInfo(): HealthStatus['system'] {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Convert memory to MB
    const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((memoryUsedMB / memoryTotalMB) * 100);

    // Calculate CPU usage (simplified)
    const cpuUsagePercentage = Math.round(
      ((cpuUsage.user + cpuUsage.system) / 1000000) * 100,
    );

    return {
      uptime,
      memory: {
        used: memoryUsedMB,
        total: memoryTotalMB,
        percentage: memoryPercentage,
      },
      cpu: {
        usage: cpuUsagePercentage,
      },
    };
  }

  // Simple health check for readiness/liveness probes
  async isHealthy(): Promise<boolean> {
    try {
      const healthStatus = await this.getHealthStatus();
      return healthStatus.status !== 'unhealthy';
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}
