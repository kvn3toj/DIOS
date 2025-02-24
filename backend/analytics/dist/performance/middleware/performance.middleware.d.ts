import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PerformanceOptimizationService } from '../services/performance-optimization.service';
export declare class PerformanceMiddleware implements NestMiddleware {
    private readonly performanceService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly requestTimes;
    private readonly requestSizes;
    constructor(performanceService: PerformanceOptimizationService, eventEmitter: EventEmitter2);
    use(req: Request, res: Response, next: NextFunction): void;
    private patchResponseMethods;
    private calculateRequestSize;
    private calculateHeadersSize;
    private calculateBodySize;
    private calculateQuerySize;
}
