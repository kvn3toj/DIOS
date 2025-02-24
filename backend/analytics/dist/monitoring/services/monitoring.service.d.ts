import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TechnicalMetric } from '../entities/technical-metric.entity';
import { BusinessMetric } from '../entities/business-metric.entity';
export declare class MonitoringService {
    private technicalMetricRepository;
    private businessMetricRepository;
    private eventEmitter;
    private readonly logger;
    private readonly updateInterval;
    private readonly technicalThresholds;
    private readonly businessThresholds;
    constructor(technicalMetricRepository: Repository<TechnicalMetric>, businessMetricRepository: Repository<BusinessMetric>, eventEmitter: EventEmitter2);
    private startMonitoring;
    private collectMetrics;
    private collectTechnicalMetrics;
    private collectBusinessMetrics;
    private getPerformanceMetrics;
    private getAvailabilityMetrics;
    private getResourceMetrics;
    private getErrorMetrics;
    private getEngagementMetrics;
    private getMonetizationMetrics;
    private getConversionMetrics;
    private saveTechnicalMetrics;
    private saveBusinessMetrics;
    private checkThresholds;
    private checkTechnicalThresholds;
    private checkBusinessThresholds;
    getTechnicalMetrics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<TechnicalMetric[]>;
    getBusinessMetrics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<BusinessMetric[]>;
    getMetricsSummary(): Promise<{
        technical: TechnicalMetric | null;
        business: BusinessMetric | null;
    }>;
}
