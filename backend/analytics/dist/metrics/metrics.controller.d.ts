import { MetricsService } from './metrics.service';
import { SystemMetricEntity, SystemMetricType } from './entities/system-metric.entity';
import { PerformanceMetricEntity, PerformanceMetricType } from './entities/performance-metric.entity';
import { ResourceMetricEntity, ResourceType, ResourceMetricType } from './entities/resource-metric.entity';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    recordSystemMetric(data: {
        type: SystemMetricType;
        service: string;
        instance: string;
        value: number;
        metadata: any;
        tags?: Record<string, string>;
    }): Promise<SystemMetricEntity>;
    recordPerformanceMetric(data: {
        type: PerformanceMetricType;
        endpoint: string;
        method: string;
        value: number;
        count?: number;
        metadata: any;
        breakdown?: any;
    }): Promise<PerformanceMetricEntity>;
    recordResourceMetric(data: {
        resourceType: ResourceType;
        metricType: ResourceMetricType;
        resourceName: string;
        region?: string;
        value: number;
        metadata: any;
        status?: any;
    }): Promise<ResourceMetricEntity>;
    getSystemMetrics(startTime: string, endTime: string, type?: SystemMetricType, service?: string, instance?: string): Promise<SystemMetricEntity[]>;
    getPerformanceMetrics(startTime: string, endTime: string, type?: PerformanceMetricType, endpoint?: string, method?: string): Promise<PerformanceMetricEntity[]>;
    getResourceMetrics(startTime: string, endTime: string, resourceType?: ResourceType, metricType?: ResourceMetricType, resourceName?: string, region?: string): Promise<ResourceMetricEntity[]>;
    getAggregatedMetrics(startTime: string, endTime: string, groupBy: 'minute' | 'hour' | 'day', type: 'system' | 'performance' | 'resource', filters?: string): Promise<any[]>;
    getMetricsSummary(startTime: string, endTime: string): Promise<any>;
    generateReport(startTime: string, endTime: string, types: string, groupBy?: string, filters?: string): Promise<any>;
}
