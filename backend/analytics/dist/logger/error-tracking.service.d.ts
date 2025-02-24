import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomLoggerService } from './logger.service';
import { ErrorLog } from './entities/error-log.entity';
export declare class ErrorTrackingService {
    private readonly errorLogRepository;
    private readonly customLogger;
    private readonly eventEmitter;
    private readonly logger;
    private readonly errorRateThreshold;
    constructor(errorLogRepository: Repository<ErrorLog>, customLogger: CustomLoggerService, eventEmitter: EventEmitter2);
    private startErrorRateMonitoring;
    trackError(error: Error, context?: string, metadata?: any): Promise<ErrorLog>;
    private determineSeverity;
    getErrors(timeRange?: {
        start: Date;
        end: Date;
    }, context?: string): Promise<ErrorLog[]>;
    getErrorAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
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
    private groupBySeverity;
    private groupByContext;
    private getTopErrors;
    private calculateErrorRate;
    private checkErrorRate;
}
