import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResourceMetric } from '../entities/resource-metric.entity';
export declare class ResourceMonitoringService {
    private readonly resourceMetricRepository;
    private readonly eventEmitter;
    private readonly logger;
    private readonly thresholds;
    constructor(resourceMetricRepository: Repository<ResourceMetric>, eventEmitter: EventEmitter2);
    private startResourceMonitoring;
    collectMetrics(): Promise<{
        timestamp: Date;
        cpu: number;
        memory: {
            used: number;
            total: number;
            percentage: number;
        };
        disk: {
            used: number;
            total: number;
            percentage: number;
        };
        network: {
            bytesIn: number;
            bytesOut: number;
        };
    }>;
    private gatherResourceMetrics;
    private getCPUUsage;
    private getMemoryUsage;
    private getDiskUsage;
    private getNetworkStats;
    private saveMetrics;
    private checkThresholds;
    getResourceMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<ResourceMetric[]>;
    getResourceAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        averages: {
            cpu: number;
            memory: number;
            disk: number;
        };
        peaks: {
            cpu: number;
            memory: number;
            disk: number;
        };
        trends: {
            cpu: "increasing" | "decreasing" | "stable";
            memory: "increasing" | "decreasing" | "stable";
            disk: "increasing" | "decreasing" | "stable";
        };
        timeRange: {
            start: Date;
            end: Date;
        };
    }>;
    private calculateAverage;
    private calculateTrend;
}
