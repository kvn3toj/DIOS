import { Repository } from 'typeorm';
import { MonitoringMetric } from './entities/monitoring-metric.entity';
export declare class MonitoringService {
    private readonly metricRepository;
    private readonly logger;
    private readonly updateInterval;
    private readonly alertThresholds;
    constructor(metricRepository: Repository<MonitoringMetric>);
    private startMonitoring;
    private collectMetrics;
    private gatherSystemMetrics;
    private getCPUUsage;
    private getMemoryMetrics;
    private getProcessMetrics;
    private getSystemMetrics;
    private saveMetrics;
    private checkAlerts;
    private saveAlerts;
    getMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<MonitoringMetric[]>;
    getAggregatedMetrics(options: {
        groupBy: 'hour' | 'day' | 'week';
        timeRange: {
            start: Date;
            end: Date;
        };
    }): Promise<any[]>;
    getAlerts(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<MonitoringMetric[]>;
    getSystemHealth(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        checks: Record<string, {
            status: string;
            message?: string;
        }>;
    }>;
}
