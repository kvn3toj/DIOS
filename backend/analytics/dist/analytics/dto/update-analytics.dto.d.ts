import { AnalyticsType, AnalyticsCategory } from '../entities/analytics.entity';
export declare class UpdateAnalyticsDto {
    type?: AnalyticsType;
    category?: AnalyticsCategory;
    event?: string;
    userId?: string;
    source?: string;
    platform?: string;
    version?: string;
    data?: Record<string, any>;
    metrics?: {
        value?: number;
        count?: number;
        duration?: number;
        custom?: Record<string, any>;
    };
    session?: {
        id: string;
        startTime: Date;
        duration: number;
    };
    timestamp?: string;
}
