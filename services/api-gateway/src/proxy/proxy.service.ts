import {
  Injectable,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { catchError, timeout, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

export interface ProxyRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly serviceUrls: Record<string, string>;
  private readonly requestTimeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrls = {
      order: this.configService.get(
        'ORDER_SERVICE_URL',
        'http://localhost:3002',
      ),
      inventory: this.configService.get(
        'INVENTORY_SERVICE_URL',
        'http://localhost:3003',
      ),
      payment: this.configService.get(
        'PAYMENT_SERVICE_URL',
        'http://localhost:3004',
      ),
      user: this.configService.get('USER_SERVICE_URL', 'http://localhost:3005'),
    };

    this.requestTimeout = this.configService.get('HTTP_TIMEOUT', 5000);
  }

  async proxyRequest(
    serviceName: string,
    path: string,
    request: Omit<ProxyRequest, 'url'>,
  ): Promise<unknown> {
    const serviceUrl = this.serviceUrls[serviceName];

    if (!serviceUrl) {
      throw new ServiceUnavailableException(
        `Service ${serviceName} is not configured`,
      );
    }

    const fullUrl = `${serviceUrl}${path}`;

    this.logger.log(`Proxying ${request.method} request to: ${fullUrl}`);

    try {
      const response = await this.makeRequest({
        ...request,
        url: fullUrl,
      }).toPromise();

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error proxying request to ${serviceName}:`,
        errorMessage,
      );

      if (error && typeof error === 'object' && 'response' in error) {
        // Service responded with an error status
        throw error;
      } else if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ECONNREFUSED'
      ) {
        throw new ServiceUnavailableException(
          `${serviceName} service is unavailable`,
        );
      } else {
        throw new ServiceUnavailableException(
          `Failed to communicate with ${serviceName} service`,
        );
      }
    }
  }

  private makeRequest(request: ProxyRequest): Observable<unknown> {
    const { method, url, headers, params } = request;
    const data = request.data as unknown;

    return this.httpService
      .request({
        method,
        url,
        data,
        headers,
        params,
        timeout: this.requestTimeout,
      })
      .pipe(
        timeout(this.requestTimeout),
        map((response: AxiosResponse) => response.data as unknown),
        catchError((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`HTTP request failed: ${errorMessage}`);
          return throwError(() => error);
        }),
      );
  }

  // Helper method to forward user context in headers
  createProxyHeaders(
    originalHeaders: Record<string, string>,
    user?: { id: string; email: string; role: string },
  ): Record<string, string> {
    const proxyHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...originalHeaders,
    };

    // Remove authorization header to avoid conflicts
    delete proxyHeaders['authorization'];
    delete proxyHeaders['Authorization'];

    // Add user context headers for internal service communication
    if (user) {
      proxyHeaders['x-user-id'] = user.id;
      proxyHeaders['x-user-email'] = user.email;
      proxyHeaders['x-user-role'] = user.role;
    }

    return proxyHeaders;
  }

  // Method to check if a service is healthy
  async checkServiceHealth(serviceName: string): Promise<boolean> {
    try {
      const serviceUrl = this.serviceUrls[serviceName];
      if (!serviceUrl) return false;

      await this.makeRequest({
        method: 'GET',
        url: `${serviceUrl}/health`,
      }).toPromise();

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `Health check failed for ${serviceName}: ${errorMessage}`,
      );
      return false;
    }
  }

  // Get all configured services and their URLs
  getServiceUrls(): Record<string, string> {
    return { ...this.serviceUrls };
  }
}
