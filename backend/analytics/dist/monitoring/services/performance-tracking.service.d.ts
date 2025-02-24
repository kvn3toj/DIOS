import { Repository } from 'typeorm';
import { MonitoringMetric } from '../entities/monitoring-metric.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class PerformanceTrackingService {
    private readonly metricRepository;
    private readonly eventEmitter;
    private readonly logger;
    private readonly updateInterval;
    private readonly performanceThresholds;
    constructor(metricRepository: Repository<MonitoringMetric>, eventEmitter: EventEmitter2);
    private startPerformanceTracking;
    private trackPerformanceMetrics;
    private collectPerformanceMetrics;
    private getCPUMetrics;
    private getMemoryMetrics;
    private getProcessMetrics;
    private getNetworkMetrics;
    private savePerformanceMetrics;
    private determineStatus;
    private analyzePerformance;
    private generateAlerts;
    getPerformanceMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<MonitoringMetric[]>;
    getPerformanceAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        averageCpuUsage: number;
        averageMemoryUsage: number;
        maxCpuUsage: number;
        maxMemoryUsage: number;
        alertsCount: number;
        timeRange: {
            start: Date;
            end: Date;
        };
    }>;
    private calculateAverage;
}
