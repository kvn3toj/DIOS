import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CircuitBreaker from 'opossum';
import * as NodeCache from 'node-cache';
import { ProxyService } from './proxy.service';
import { MetricsService } from './metrics.service';
import { DiscoveryService } from './discovery.service';
import { LoadBalancerService } from './load-balancer.service';
import { TransformationService } from './transformation.service';

@Injectable()
export class GatewayService implements OnModuleInit {
  private readonly cache: NodeCache;
  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
    private readonly metricsService: MetricsService,
    private readonly discoveryService: DiscoveryService,
    private readonly loadBalancerService: LoadBalancerService,
    private readonly transformationService: TransformationService
  ) {
    // Initialize cache
    const cacheConfig = this.configService.get('gateway.cache');
    this.cache = new NodeCache({
      stdTTL: cacheConfig.ttl,
      maxKeys: cacheConfig.max
    });
  }

  async onModuleInit() {
    // Initialize circuit breakers for each service
    const services = this.configService.get('gateway.services');
    for (const [serviceName, serviceConfig] of Object.entries(services)) {
      const breaker = new CircuitBreaker(async (request) => {
        const endpoint = await this.loadBalancerService.getEndpoint(serviceName);
        return this.proxyService.forward(request, endpoint);
      }, {
        timeout: serviceConfig.timeout,
        errorThresholdPercentage: this.configService.get('gateway.circuitBreaker.failureThreshold'),
        resetTimeout: this.configService.get('gateway.circuitBreaker.resetTimeout')
      });

      breaker.on('open', () => {
        this.metricsService.recordCircuitBreakerState(serviceName, 'open');
      });

      breaker.on('halfOpen', () => {
        this.metricsService.recordCircuitBreakerState(serviceName, 'half-open');
      });

      breaker.on('close', () => {
        this.metricsService.recordCircuitBreakerState(serviceName, 'closed');
      });

      this.circuitBreakers.set(serviceName, breaker);
    }

    // Start service discovery if enabled
    if (this.configService.get('gateway.discovery.enabled')) {
      await this.discoveryService.startDiscovery();
    }

    // Start health checks if enabled
    if (this.configService.get('gateway.loadBalancing.healthCheck.enabled')) {
      this.loadBalancerService.startHealthChecks();
    }

    // Start metrics collection if enabled
    if (this.configService.get('gateway.monitoring.metrics.enabled')) {
      this.metricsService.startCollection();
    }
  }

  async handleRequest(request: any) {
    const startTime = Date.now();
    const serviceName = this.getServiceNameFromRequest(request);
    const cacheKey = this.getCacheKey(request);

    try {
      // Check cache if enabled
      if (this.configService.get('gateway.cache.enabled')) {
        const cachedResponse = this.cache.get(cacheKey);
        if (cachedResponse) {
          this.metricsService.recordCacheHit(serviceName);
          return cachedResponse;
        }
      }

      // Transform request if enabled
      if (this.configService.get('gateway.transformation.request.enabled')) {
        request = await this.transformationService.transformRequest(request);
      }

      // Use circuit breaker to handle request
      const breaker = this.circuitBreakers.get(serviceName);
      const response = await breaker.fire(request);

      // Transform response if enabled
      if (this.configService.get('gateway.transformation.response.enabled')) {
        response.body = await this.transformationService.transformResponse(response.body);
      }

      // Cache response if enabled
      if (this.configService.get('gateway.cache.enabled')) {
        this.cache.set(cacheKey, response);
      }

      // Record metrics
      const duration = Date.now() - startTime;
      this.metricsService.recordRequestMetrics(serviceName, duration, response.status);

      return response;
    } catch (error) {
      this.metricsService.recordError(serviceName, error);
      throw error;
    }
  }

  private getServiceNameFromRequest(request: any): string {
    // Extract service name from request path or headers
    const path = request.path.split('/')[1];
    return path || 'default';
  }

  private getCacheKey(request: any): string {
    // Generate cache key based on request method, path, and query parameters
    return `${request.method}:${request.path}:${JSON.stringify(request.query)}`;
  }
} 