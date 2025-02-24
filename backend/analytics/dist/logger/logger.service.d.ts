import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class CustomLoggerService implements LoggerService {
    private configService;
    private logger;
    constructor(configService: ConfigService);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logPerformance(operation: string, duration: number, metadata?: any): void;
    logBusinessEvent(event: string, data: any): void;
}
