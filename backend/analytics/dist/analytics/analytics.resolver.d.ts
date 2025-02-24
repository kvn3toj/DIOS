import { AnalyticsService } from './analytics.service';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
export declare class AnalyticsResolver {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackAnalytics(createAnalyticsDto: CreateAnalyticsDto): Promise<AnalyticsEntity>;
    analytics(startTime: Date, endTime: Date, type?: AnalyticsType, category?: AnalyticsCategory, userId?: string): Promise<AnalyticsEntity[]>;
    userAnalytics(userId: string, startTime?: Date, endTime?: Date): Promise<AnalyticsEntity[]>;
    eventAnalytics(event: string, startTime?: Date, endTime?: Date): Promise<AnalyticsEntity[]>;
    aggregatedMetrics(groupBy: 'hour' | 'day' | 'week' | 'month', startTime: Date, endTime: Date, type?: AnalyticsType, category?: AnalyticsCategory): Promise<any[]>;
    metricsSummary(startTime: Date, endTime: Date): Promise<any>;
    analyticsReport(startTime: Date, endTime: Date, type?: AnalyticsType, category?: AnalyticsCategory, groupBy?: 'hour' | 'day' | 'week' | 'month', metrics?: string[]): Promise<any>;
    updateAnalytics(id: string, updateAnalyticsDto: UpdateAnalyticsDto): Promise<AnalyticsEntity>;
    removeAnalytics(id: string): Promise<boolean>;
}
