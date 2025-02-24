import { AnalyticsType } from '../enums/analytics-type.enum';
import { AnalyticsCategory } from '../enums/analytics-category.enum';
export declare class AnalyticsEntity {
    id: string;
    type: AnalyticsType;
    category: AnalyticsCategory;
    event: string;
    userId?: string;
    sessionId?: string;
    deviceId?: string;
    source?: string;
    platform?: string;
    version?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    context?: {
        url?: string;
        referrer?: string;
        userAgent?: string;
        ipAddress?: string;
    };
    customData?: Record<string, any>;
    data?: Record<string, any>;
    metrics?: {
        value?: number;
        count?: number;
        duration?: number;
        custom?: Record<string, number>;
    };
    session?: {
        id: string;
        startTime: Date;
        duration?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
