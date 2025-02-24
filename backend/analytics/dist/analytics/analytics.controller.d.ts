import { AnalyticsService } from './analytics.service';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackEvent(createAnalyticsDto: CreateAnalyticsDto): Promise<AnalyticsEntity>;
    findAll(startTime: string, endTime: string, type?: AnalyticsType, category?: AnalyticsCategory, userId?: string): Promise<AnalyticsEntity[]>;
    getUserAnalytics(userId: string, startTime?: string, endTime?: string): Promise<AnalyticsEntity[]>;
    getEventAnalytics(event: string, startTime?: string, endTime?: string): Promise<AnalyticsEntity[]>;
    getAggregatedMetrics(groupBy: 'hour' | 'day' | 'week' | 'month', startTime: string, endTime: string, type?: AnalyticsType, category?: AnalyticsCategory): Promise<any[]>;
    getMetricsSummary(startTime: string, endTime: string): Promise<any>;
    generateReport(startTime: string, endTime: string, type?: AnalyticsType, category?: AnalyticsCategory, groupBy?: 'hour' | 'day' | 'week' | 'month', metrics?: string): Promise<any>;
    update(id: string, updateAnalyticsDto: UpdateAnalyticsDto): Promise<AnalyticsEntity>;
    remove(id: string): Promise<boolean>;
}
