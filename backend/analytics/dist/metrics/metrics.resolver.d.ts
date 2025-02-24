import { MetricsService } from './metrics.service';
import { SystemMetricEntity, SystemMetricType } from './entities/system-metric.entity';
import { PerformanceMetricEntity, PerformanceMetricType } from './entities/performance-metric.entity';
import { ResourceMetricEntity, ResourceType, ResourceMetricType } from './entities/resource-metric.entity';
export declare class MetricsResolver {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    recordSystemMetric(type: SystemMetricType, service: string, instance: string, value: number, metadata: any, tags?: Record<string, string>): Promise<SystemMetricEntity>;
    recordPerformanceMetric(type: PerformanceMetricType, endpoint: string, method: string, value: number, count?: number, metadata: any, breakdown?: any): Promise<PerformanceMetricEntity>;
    recordResourceMetric(resourceType: ResourceType, metricType: ResourceMetricType, resourceName: string, region: string, value: number, metadata: any, status?: any): Promise<ResourceMetricEntity>;
    systemMetrics(startTime: Date, endTime: Date, type?: SystemMetricType, service?: string, instance?: string): Promise<SystemMetricEntity[]>;
    performanceMetrics(startTime: Date, endTime: Date, type?: PerformanceMetricType, endpoint?: string, method?: string): Promise<PerformanceMetricEntity[]>;
    resourceMetrics(startTime: Date, endTime: Date, resourceType?: ResourceType, metricType?: ResourceMetricType, resourceName?: string, region?: string): Promise<ResourceMetricEntity[]>;
    aggregatedMetrics(startTime: Date, endTime: Date, groupBy: 'minute' | 'hour' | 'day', type: 'system' | 'performance' | 'resource', filters?: Record<string, any>): Promise<any[]>;
    metricsSummary(startTime: Date, endTime: Date): Promise<any>;
    metricsReport(startTime: Date, endTime: Date, types: string[], groupBy?: string, filters?: Record<string, any>): Promise<any>;
}
