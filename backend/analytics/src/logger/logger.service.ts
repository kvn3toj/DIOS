import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as Sentry from '@sentry/node';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    // Initialize Sentry
    Sentry.init({
      dsn: this.configService.get<string>('SENTRY_DSN'),
      environment: this.configService.get<string>('NODE_ENV'),
      tracesSampleRate: 1.0,
    });

    // Initialize Winston
    this.logger = winston.createLogger({
      level: this.configService.get<string>('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'analytics-service' },
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    // Log to Winston
    this.logger.error(message, { trace, context });

    // Send to Sentry
    Sentry.captureException(new Error(message), {
      extra: {
        trace,
        context,
      },
    });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Method to capture performance metrics
  logPerformance(operation: string, duration: number, metadata?: any) {
    this.logger.info('Performance metric', {
      operation,
      duration,
      ...metadata,
    });

    // Send performance data to Sentry
    const transaction = Sentry.startTransaction({
      op: operation,
      name: `PERF/${operation}`,
    });

    transaction.setMeasurement('duration_ms', duration);
    transaction.finish();
  }

  // Method to track business events
  logBusinessEvent(event: string, data: any) {
    this.logger.info('Business event', {
      event,
      data,
    });

    // Send business event to Sentry
    Sentry.captureMessage(`BUSINESS/${event}`, {
      level: 'info',
      extra: data,
    });
  }
} 