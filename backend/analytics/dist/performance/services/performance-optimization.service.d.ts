import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../shared/services/redis.service';
import { MetricsService } from '../../services/metrics.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
export declare class PerformanceOptimizationService {
    private readonly configService;
    private readonly redisService;
    private readonly metricsService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly config;
    private readonly metrics;
    private readonly resourceUsage;
    constructor(configService: ConfigService, redisService: RedisService, metricsService: MetricsService, eventEmitter: EventEmitter2);
    private loadConfig;
    private initializeMonitoring;
    optimizeResponse(response: any, options?: {
        cache?: boolean;
        compress?: boolean;
        transform?: boolean;
    }): Promise<any>;
    optimizeResources(resources: any[]): Promise<any[]>;
    getPerformanceMetrics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<PerformanceMetrics[]>;
    private getCachedResponse;
    private cacheResponse;
    private compressResponse;
    private transformResponse;
    private minifyJavaScript;
    private minifyCSS;
    private optimizeImage;
    private collectSystemMetrics;
    private recordRequestMetrics;
    private recordCacheMetrics;
    private recordOptimizationMetrics;
    private createInitialMetrics;
    private updateMetrics;
    private aggregateMetrics;
    private checkThresholds;
    private emitAlert;
}
export {};
