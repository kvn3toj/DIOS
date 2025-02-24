import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { RealTimeAnalyticsService } from './services/real-time-analytics.service';
import { BatchAnalyticsService } from './services/batch-analytics.service';
import { AggregationService } from './services/aggregation.service';
export declare class AnalyticsService {
    private readonly analyticsRepository;
    private readonly messageQueue;
    private readonly realTimeAnalytics;
    private readonly batchAnalytics;
    private readonly aggregationService;
    constructor(analyticsRepository: Repository<AnalyticsEntity>, messageQueue: ClientProxy, realTimeAnalytics: RealTimeAnalyticsService, batchAnalytics: BatchAnalyticsService, aggregationService: AggregationService);
    trackEvent(data: CreateAnalyticsDto): Promise<AnalyticsEntity>;
    findByTimeRange(startTime: Date, endTime: Date, filters?: {
        type?: AnalyticsType;
        category?: AnalyticsCategory;
        userId?: string;
    }): Promise<AnalyticsEntity[]>;
    getAggregatedMetrics(options: {
        groupBy: 'hour' | 'day' | 'week' | 'month';
        timeRange: {
            start: Date;
            end: Date;
        };
        type?: AnalyticsType;
        category?: AnalyticsCategory;
    }): Promise<any[]>;
    getUserAnalytics(userId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<AnalyticsEntity[]>;
    getEventAnalytics(event: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<AnalyticsEntity[]>;
    update(id: string, updateAnalyticsDto: UpdateAnalyticsDto): Promise<AnalyticsEntity>;
    remove(id: string): Promise<boolean>;
    getMetricsSummary(timeRange: {
        start: Date;
        end: Date;
    }): Promise<any>;
    generateReport(options: {
        timeRange: {
            start: Date;
            end: Date;
        };
        type?: AnalyticsType;
        category?: AnalyticsCategory;
        groupBy?: 'hour' | 'day' | 'week' | 'month';
        metrics?: string[];
    }): Promise<any>;
}
