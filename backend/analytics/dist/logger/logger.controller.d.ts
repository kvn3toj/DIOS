import { ErrorTrackingService } from './error-tracking.service';
export declare class LoggerController {
    private readonly errorTrackingService;
    constructor(errorTrackingService: ErrorTrackingService);
    getErrors(start?: string, end?: string, context?: string): Promise<import("./entities/error-log.entity").ErrorLog[]>;
    getErrorAnalytics(start: string, end: string): Promise<{
        totalErrors: number;
        errorsBySeverity: Record<string, number>;
        errorsByContext: Record<string, number>;
        topErrors: {
            error: string;
            count: number;
        }[];
        errorRate: number;
        timeRange: {
            start: Date;
            end: Date;
        };
    }>;
    updateErrorStatus(id: string, updateData: {
        status: 'new' | 'investigating' | 'resolved' | 'ignored';
        resolution?: string;
        resolvedBy?: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: import("./entities/error-log.entity").ErrorLog;
        message?: undefined;
    }>;
}
