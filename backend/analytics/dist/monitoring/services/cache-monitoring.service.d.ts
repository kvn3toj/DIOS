import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheMetric } from '../entities/cache-metric.entity';
export declare class CacheMonitoringService {
    private readonly cacheMetricRepository;
    private readonly eventEmitter;
    private readonly logger;
    private readonly updateInterval;
    private readonly thresholds;
    constructor(cacheMetricRepository: Repository<CacheMetric>, eventEmitter: EventEmitter2);
    private startCacheMonitoring;
    collectMetrics(): Promise<{
        application: {
            routeCache: {
                hitRate: number;
                size: number;
                entries: number;
            };
            dataCache: {
                hitRate: number;
                size: number;
                entries: number;
            };
            queryCache: {
                hitRate: number;
                size: number;
                entries: number;
            };
        };
        memcached: {
            hitRate: number;
            missRate: number;
            memoryUsage: number;
            evictionCount: number;
            currentConnections: number;
            totalItems: number;
            getHits: number;
            getMisses: number;
            latency: number;
        };
        redis: {
            hitRate: number;
            missRate: number;
            memoryUsage: number;
            evictionCount: number;
            connectedClients: number;
            commandsProcessed: number;
            keyspaceHits: number;
            keyspaceMisses: number;
            latency: number;
        };
        timestamp: Date;
    }>;
    private gatherCacheMetrics;
    private getRedisMetrics;
    private getMemcachedMetrics;
    private getApplicationCacheMetrics;
    private saveMetrics;
    private checkThresholds;
    getCacheMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<CacheMetric[]>;
    getCacheAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        redis: {
            performance: {
                avgHitRate: number;
                avgLatency: number;
                evictionRate: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            usage: {
                avgMemoryUsage: number;
                peakMemoryUsage: number;
                avgConnections: number;
            };
        };
        memcached: {
            performance: {
                avgHitRate: number;
                avgLatency: number;
                evictionRate: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            usage: {
                avgMemoryUsage: number;
                peakMemoryUsage: number;
                avgConnections: number;
            };
        };
        application: {
            routeCache: {
                avgHitRate: number;
                avgSize: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            dataCache: {
                avgHitRate: number;
                avgSize: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            queryCache: {
                avgHitRate: number;
                avgSize: number;
                trend: "increasing" | "decreasing" | "stable";
            };
        };
    }>;
    private calculateAverage;
    private calculateEvictionRate;
    private calculateTrend;
}
