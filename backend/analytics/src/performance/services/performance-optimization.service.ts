import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/services/redis.service';
import { MetricsService } from '../../services/metrics.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface PerformanceConfig {
  caching: {
    enabled: boolean;
    ttl: number;
    maxItems: number;
  };
  compression: {
    enabled: boolean;
    level: number;
    threshold: number;
  };
  optimization: {
    minifyJs: boolean;
    minifyCss: boolean;
    imageOptimization: boolean;
    lazyLoading: boolean;
  };
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    alertThresholds: {
      responseTime: number;
      errorRate: number;
      memoryUsage: number;
    };
  };
}

interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    successRate: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskIO: number;
  };
  caching: {
    hitRate: number;
    missRate: number;
    size: number;
  };
}

@Injectable()
export class PerformanceOptimizationService {
  private readonly logger = new Logger(PerformanceOptimizationService.name);
  private readonly config: PerformanceConfig;
  private readonly metrics: Map<string, PerformanceMetrics> = new Map();
  private readonly resourceUsage: Map<string, number> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly metricsService: MetricsService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.config = this.loadConfig();
    this.initializeMonitoring();
  }

  private loadConfig(): PerformanceConfig {
    return {
      caching: {
        enabled: this.configService.get('PERFORMANCE_CACHE_ENABLED') === 'true',
        ttl: parseInt(this.configService.get('PERFORMANCE_CACHE_TTL') || '3600'),
        maxItems: parseInt(this.configService.get('PERFORMANCE_CACHE_MAX_ITEMS') || '1000'),
      },
      compression: {
        enabled: this.configService.get('PERFORMANCE_COMPRESSION_ENABLED') === 'true',
        level: parseInt(this.configService.get('PERFORMANCE_COMPRESSION_LEVEL') || '6'),
        threshold: parseInt(this.configService.get('PERFORMANCE_COMPRESSION_THRESHOLD') || '1024'),
      },
      optimization: {
        minifyJs: this.configService.get('PERFORMANCE_MINIFY_JS') === 'true',
        minifyCss: this.configService.get('PERFORMANCE_MINIFY_CSS') === 'true',
        imageOptimization: this.configService.get('PERFORMANCE_IMAGE_OPTIMIZATION') === 'true',
        lazyLoading: this.configService.get('PERFORMANCE_LAZY_LOADING') === 'true',
      },
      monitoring: {
        enabled: this.configService.get('PERFORMANCE_MONITORING_ENABLED') === 'true',
        sampleRate: parseFloat(this.configService.get('PERFORMANCE_SAMPLE_RATE') || '0.1'),
        alertThresholds: {
          responseTime: parseInt(this.configService.get('PERFORMANCE_ALERT_RESPONSE_TIME') || '1000'),
          errorRate: parseFloat(this.configService.get('PERFORMANCE_ALERT_ERROR_RATE') || '0.05'),
          memoryUsage: parseFloat(this.configService.get('PERFORMANCE_ALERT_MEMORY_USAGE') || '0.9'),
        },
      },
    };
  }

  private initializeMonitoring(): void {
    if (!this.config.monitoring.enabled) return;

    // Monitor system metrics
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute

    // Subscribe to performance-related events
    this.eventEmitter.on('request.complete', (data: any) => {
      this.recordRequestMetrics(data);
    });

    this.eventEmitter.on('cache.operation', (data: any) => {
      this.recordCacheMetrics(data);
    });
  }

  async optimizeResponse(response: any, options: {
    cache?: boolean;
    compress?: boolean;
    transform?: boolean;
  } = {}): Promise<any> {
    const startTime = Date.now();

    try {
      // Apply caching if enabled
      if (options.cache && this.config.caching.enabled) {
        const cached = await this.getCachedResponse(response);
        if (cached) return cached;
      }

      // Apply compression if enabled and response size is above threshold
      if (options.compress && this.config.compression.enabled) {
        response = await this.compressResponse(response);
      }

      // Apply transformations if enabled
      if (options.transform) {
        response = await this.transformResponse(response);
      }

      // Cache the optimized response
      if (options.cache && this.config.caching.enabled) {
        await this.cacheResponse(response);
      }

      // Record metrics
      const duration = Date.now() - startTime;
      this.recordOptimizationMetrics(duration);

      return response;
    } catch (error) {
      this.logger.error('Response optimization failed:', error);
      throw error;
    }
  }

  async optimizeResources(resources: any[]): Promise<any[]> {
    if (!this.config.optimization.enabled) return resources;

    const optimizedResources = await Promise.all(
      resources.map(async (resource) => {
        switch (resource.type) {
          case 'javascript':
            return this.config.optimization.minifyJs ? 
              await this.minifyJavaScript(resource) : resource;
          case 'css':
            return this.config.optimization.minifyCss ? 
              await this.minifyCSS(resource) : resource;
          case 'image':
            return this.config.optimization.imageOptimization ? 
              await this.optimizeImage(resource) : resource;
          default:
            return resource;
        }
      })
    );

    return optimizedResources;
  }

  async getPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<PerformanceMetrics[]> {
    try {
      const metrics = await this.metricsService.getMetricsInRange('performance', timeRange);
      return this.aggregateMetrics(metrics);
    } catch (error) {
      this.logger.error('Failed to retrieve performance metrics:', error);
      throw error;
    }
  }

  private async getCachedResponse(key: string): Promise<any> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        this.eventEmitter.emit('cache.operation', { type: 'hit', key });
        return JSON.parse(cached);
      }
      this.eventEmitter.emit('cache.operation', { type: 'miss', key });
      return null;
    } catch (error) {
      this.logger.error('Cache retrieval failed:', error);
      return null;
    }
  }

  private async cacheResponse(key: string, value: any): Promise<void> {
    try {
      await this.redisService.set(
        key,
        JSON.stringify(value),
        this.config.caching.ttl
      );
      this.eventEmitter.emit('cache.operation', { type: 'set', key });
    } catch (error) {
      this.logger.error('Cache storage failed:', error);
    }
  }

  private async compressResponse(response: any): Promise<any> {
    // Implement compression logic based on response type
    return response;
  }

  private async transformResponse(response: any): Promise<any> {
    // Implement response transformation logic
    return response;
  }

  private async minifyJavaScript(resource: any): Promise<any> {
    // Implement JavaScript minification
    return resource;
  }

  private async minifyCSS(resource: any): Promise<any> {
    // Implement CSS minification
    return resource;
  }

  private async optimizeImage(resource: any): Promise<any> {
    // Implement image optimization
    return resource;
  }

  private collectSystemMetrics(): void {
    const metrics = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      resourceUsage: this.resourceUsage,
    };

    this.checkThresholds(metrics);
    this.eventEmitter.emit('system.metrics', metrics);
  }

  private recordRequestMetrics(data: any): void {
    const { duration, status, endpoint } = data;
    
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, this.createInitialMetrics());
    }

    const metrics = this.metrics.get(endpoint)!;
    this.updateMetrics(metrics, duration, status);
  }

  private recordCacheMetrics(data: any): void {
    const { type, key } = data;
    // Update cache-specific metrics
  }

  private recordOptimizationMetrics(duration: number): void {
    // Record optimization-specific metrics
  }

  private createInitialMetrics(): PerformanceMetrics {
    return {
      responseTime: { avg: 0, p95: 0, p99: 0 },
      throughput: { requestsPerSecond: 0, successRate: 0 },
      resources: { cpuUsage: 0, memoryUsage: 0, diskIO: 0 },
      caching: { hitRate: 0, missRate: 0, size: 0 },
    };
  }

  private updateMetrics(metrics: PerformanceMetrics, duration: number, status: number): void {
    // Update metrics calculations
  }

  private aggregateMetrics(metrics: any[]): PerformanceMetrics[] {
    // Aggregate and process metrics
    return metrics;
  }

  private checkThresholds(metrics: any): void {
    const { alertThresholds } = this.config.monitoring;

    if (metrics.responseTime > alertThresholds.responseTime) {
      this.emitAlert('High response time detected', metrics);
    }

    if (metrics.errorRate > alertThresholds.errorRate) {
      this.emitAlert('High error rate detected', metrics);
    }

    if (metrics.memoryUsage > alertThresholds.memoryUsage) {
      this.emitAlert('High memory usage detected', metrics);
    }
  }

  private emitAlert(message: string, data: any): void {
    this.eventEmitter.emit('performance.alert', {
      message,
      timestamp: new Date(),
      data,
    });
  }
} 