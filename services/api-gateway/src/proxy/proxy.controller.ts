import {
  Controller,
  All,
  Req,
  Res,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';

import { ProxyService } from './proxy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('proxy')
@Controller({ path: 'services', version: '1' })
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @All(':service/*')
  async proxyToService(
    @Param('service') serviceName: string,
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user?: { id: string; email: string; role: string },
  ): Promise<void> {
    try {
      // Extract the path after the service name
      const originalUrl = req.originalUrl;
      const servicePath =
        originalUrl.split(`/api/v1/services/${serviceName}`)[1] || '/';

      this.logger.log(
        `Proxying ${req.method} request to ${serviceName}${servicePath}`,
      );

      // Prepare headers for internal service communication
      const proxyHeaders = this.proxyService.createProxyHeaders(
        req.headers as Record<string, string>,
        user,
      );

      // Proxy the request
      const response: unknown = await this.proxyService.proxyRequest(
        serviceName,
        servicePath,
        {
          method: req.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
          data: req.body as unknown,
          headers: proxyHeaders,
          params: req.query as Record<string, unknown>,
        },
      );

      // Forward the response
      res.status(200).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Proxy error for ${serviceName}:`, errorMessage);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; data: unknown };
        };
        // Forward the exact error response from the service
        res.status(axiosError.response.status).json(axiosError.response.data);
      } else {
        // Gateway-level error
        res.status(503).json({
          statusCode: 503,
          message: errorMessage || `Service ${serviceName} is unavailable`,
          error: 'Service Unavailable',
        });
      }
    }
  }

  // Public health check endpoint for services
  @Public()
  @All('health/:service')
  async checkServiceHealth(
    @Param('service') serviceName: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const isHealthy = await this.proxyService.checkServiceHealth(serviceName);

      if (isHealthy) {
        res.status(200).json({
          service: serviceName,
          status: 'healthy',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          service: serviceName,
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(503).json({
        service: serviceName,
        status: 'error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
