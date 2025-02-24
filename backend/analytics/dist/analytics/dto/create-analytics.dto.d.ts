import { AnalyticsType, AnalyticsCategory } from '../entities/analytics.entity';
declare class MetricsInput {
    value?: number;
    count?: number;
    duration?: number;
    custom?: Record<string, number>;
}
declare class SessionInput {
    id: string;
    startTime: Date;
    duration?: number;
}
export declare class CreateAnalyticsDto {
    type: AnalyticsType;
    category: AnalyticsCategory;
    event: string;
    userId?: string;
    source?: string;
    platform?: string;
    version?: string;
    data?: Record<string, any>;
    metrics?: MetricsInput;
    session?: SessionInput;
    timestamp?: string;
}
export {};
