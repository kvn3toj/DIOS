import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PerformanceOptimizationService } from '../services/performance-optimization.service';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PerformanceMiddleware.name);
  private readonly requestTimes = new Map<string, number>();
  private readonly requestSizes = new Map<string, number>();

  constructor(
    private readonly performanceService: PerformanceOptimizationService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string || Date.now().toString();
    const startTime = process.hrtime();

    // Record initial request size
    this.requestSizes.set(requestId, this.calculateRequestSize(req));

    // Patch response methods to track performance
    this.patchResponseMethods(res, requestId, startTime);

    // Add custom response headers
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('Server-Timing', 'requestStart;dur=0');

    // Continue request processing
    next();
  }

  private patchResponseMethods(res: Response, requestId: string, startTime: [number, number]) {
    const originalEnd = res.end;
    const originalWrite = res.write;
    let responseSize = 0;

    // Patch write method to track response size
    res.write = (...args: any[]) => {
      if (args[0]) {
        responseSize += args[0].length;
      }
      return originalWrite.apply(res, args);
    };

    // Patch end method to collect final metrics
    res.end = (...args: any[]) => {
      const endTime = process.hrtime(startTime);
      const duration = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

      // Calculate final response size
      if (args[0]) {
        responseSize += args[0].length;
      }

      // Collect performance metrics
      const metrics = {
        requestId,
        method: res.req.method,
        url: res.req.url,
        statusCode: res.statusCode,
        duration,
        requestSize: this.requestSizes.get(requestId) || 0,
        responseSize,
        timestamp: new Date(),
        headers: {
          request: res.req.headers,
          response: res.getHeaders(),
        },
      };

      // Emit metrics event
      this.eventEmitter.emit('request.complete', metrics);

      // Update Server-Timing header
      const serverTiming = [
        'requestStart;dur=0',
        `total;dur=${duration.toFixed(2)}`,
      ].join(', ');
      res.setHeader('Server-Timing', serverTiming);

      // Clean up
      this.requestSizes.delete(requestId);
      this.requestTimes.delete(requestId);

      // Call original end method
      return originalEnd.apply(res, args);
    };
  }

  private calculateRequestSize(req: Request): number {
    let size = 0;

    // Calculate headers size
    size += this.calculateHeadersSize(req.headers);

    // Calculate body size
    if (req.body) {
      size += this.calculateBodySize(req.body);
    }

    // Calculate query string size
    if (req.query) {
      size += this.calculateQuerySize(req.query);
    }

    return size;
  }

  private calculateHeadersSize(headers: Record<string, any>): number {
    return Object.entries(headers).reduce((size, [key, value]) => {
      return size + key.length + (value ? value.toString().length : 0);
    }, 0);
  }

  private calculateBodySize(body: any): number {
    try {
      return JSON.stringify(body).length;
    } catch (error) {
      this.logger.warn('Failed to calculate body size:', error);
      return 0;
    }
  }

  private calculateQuerySize(query: Record<string, any>): number {
    try {
      return JSON.stringify(query).length;
    } catch (error) {
      this.logger.warn('Failed to calculate query size:', error);
      return 0;
    }
  }
} 