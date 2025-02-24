import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomLoggerService } from './logger.service';
import { ErrorLog } from './entities/error-log.entity';

@Injectable()
export class ErrorTrackingService {
  private readonly logger = new Logger(ErrorTrackingService.name);
  private readonly errorRateThreshold = {
    warning: 5, // 5 errors per minute
    critical: 10 // 10 errors per minute
  };

  constructor(
    @InjectRepository(ErrorLog)
    private readonly errorLogRepository: Repository<ErrorLog>,
    private readonly customLogger: CustomLoggerService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.startErrorRateMonitoring();
  }

  private startErrorRateMonitoring() {
    setInterval(() => {
      this.checkErrorRate().catch(err => 
        this.logger.error('Error checking error rate:', err)
      );
    }, 60000); // Check every minute
  }

  async trackError(error: Error, context?: string, metadata?: any) {
    const errorLog = this.errorLogRepository.create({
      timestamp: new Date(),
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: context || 'unknown',
      metadata: metadata || {},
      severity: this.determineSeverity(error),
      status: 'new'
    });

    await this.errorLogRepository.save(errorLog);
    
    // Emit error event for real-time monitoring
    this.eventEmitter.emit('error.tracked', errorLog);
    
    // Log to custom logger (which handles Sentry)
    this.customLogger.error(error.message, error.stack, context);

    return errorLog;
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return 'high';
    }
    if (error instanceof SyntaxError) {
      return 'critical';
    }
    if (error.message.toLowerCase().includes('database') || 
        error.message.toLowerCase().includes('connection')) {
      return 'critical';
    }
    return 'medium';
  }

  async getErrors(timeRange?: { start: Date; end: Date }, context?: string) {
    const query = this.errorLogRepository.createQueryBuilder('error');

    if (timeRange) {
      query.where('error.timestamp BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end
      });
    }

    if (context) {
      query.andWhere('error.context = :context', { context });
    }

    return query.orderBy('error.timestamp', 'DESC').getMany();
  }

  async getErrorAnalytics(timeRange: { start: Date; end: Date }) {
    const errors = await this.getErrors(timeRange);
    
    const analytics = {
      totalErrors: errors.length,
      errorsBySeverity: this.groupBySeverity(errors),
      errorsByContext: this.groupByContext(errors),
      topErrors: this.getTopErrors(errors),
      errorRate: this.calculateErrorRate(errors, timeRange),
      timeRange
    };

    return analytics;
  }

  private groupBySeverity(errors: ErrorLog[]) {
    return errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByContext(errors: ErrorLog[]) {
    return errors.reduce((acc, error) => {
      acc[error.context] = (acc[error.context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopErrors(errors: ErrorLog[]) {
    const errorCount = errors.reduce((acc, error) => {
      const key = `${error.name}: ${error.message}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
  }

  private calculateErrorRate(errors: ErrorLog[], timeRange: { start: Date; end: Date }) {
    const timeSpanMinutes = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60);
    return errors.length / timeSpanMinutes;
  }

  private async checkErrorRate() {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const recentErrors = await this.errorLogRepository.count({
      where: {
        timestamp: Between(oneMinuteAgo, now)
      }
    });

    const errorRate = recentErrors;

    if (errorRate >= this.errorRateThreshold.critical) {
      this.eventEmitter.emit('error.rate.critical', {
        rate: errorRate,
        threshold: this.errorRateThreshold.critical,
        timestamp: now
      });
    } else if (errorRate >= this.errorRateThreshold.warning) {
      this.eventEmitter.emit('error.rate.warning', {
        rate: errorRate,
        threshold: this.errorRateThreshold.warning,
        timestamp: now
      });
    }

    return errorRate;
  }
} 