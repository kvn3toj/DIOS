import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { SystemMetricEntity, SystemMetricType } from './entities/system-metric.entity';
import { PerformanceMetricEntity, PerformanceMetricType } from './entities/performance-metric.entity';
import { ResourceMetricEntity, ResourceType, ResourceMetricType } from './entities/resource-metric.entity';
import { MetricsCollectorService } from './services/metrics-collector.service';
import { MetricsProcessorService } from './services/metrics-processor.service';
import { AlertingService } from './services/alerting.service';
export declare class MetricsService {
    private readonly systemMetricsRepository;
    private readonly performanceMetricsRepository;
    private readonly resourceMetricsRepository;
    private readonly messageQueue;
    private readonly metricsCollector;
    private readonly metricsProcessor;
    private readonly alertingService;
    constructor(systemMetricsRepository: Repository<SystemMetricEntity>, performanceMetricsRepository: Repository<PerformanceMetricEntity>, resourceMetricsRepository: Repository<ResourceMetricEntity>, messageQueue: ClientProxy, metricsCollector: MetricsCollectorService, metricsProcessor: MetricsProcessorService, alertingService: AlertingService);
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
    getSystemMetrics(options: {
        startTime: Date;
        endTime: Date;
        type?: SystemMetricType;
        service?: string;
        instance?: string;
    }): Promise<SystemMetricEntity[]>;
    getPerformanceMetrics(options: {
        startTime: Date;
        endTime: Date;
        type?: PerformanceMetricType;
        endpoint?: string;
        method?: string;
    }): Promise<PerformanceMetricEntity[]>;
    getResourceMetrics(options: {
        startTime: Date;
        endTime: Date;
        resourceType?: ResourceType;
        metricType?: ResourceMetricType;
        resourceName?: string;
        region?: string;
    }): Promise<ResourceMetricEntity[]>;
    getAggregatedMetrics(options: {
        startTime: Date;
        endTime: Date;
        groupBy: 'minute' | 'hour' | 'day';
        type: 'system' | 'performance' | 'resource';
        filters?: Record<string, any>;
    }): Promise<any[]>;
    getMetricsSummary(timeRange: {
        start: Date;
        end: Date;
    }): Promise<any>;
    generateReport(options: {
        startTime: Date;
        endTime: Date;
        types: string[];
        groupBy?: string;
        filters?: Record<string, any>;
    }): Promise<any>;
}
