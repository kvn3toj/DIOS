import { Channel } from 'amqplib';
import { Redis } from 'ioredis';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import {
  Analytics,
  AnalyticsType,
  AnalyticsCategory,
} from '../models/Analytics';

interface BatchConfig {
  batchSize: number;
  processingInterval: number;
  retentionPeriod: number;
  aggregationWindows: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
  };
}

interface AggregatedMetrics {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  distinctUsers: number;
  metadata: Record<string, any>;
}

export class BatchAnalyticsService {
  private channel: Channel;
  private redis: Redis;
  private analyticsRepository: AnalyticsRepository;
  private isProcessing: boolean = false;
  private readonly config: BatchConfig = {
    batchSize: 1000,
    processingInterval: 5 * 60 * 1000, // 5 minutes
    retentionPeriod: 90 * 24 * 60 * 60, // 90 days
    aggregationWindows: {
      hourly: 60 * 60, // 1 hour in seconds
      daily: 24 * 60 * 60, // 1 day in seconds
      weekly: 7 * 24 * 60 * 60, // 1 week in seconds
      monthly: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  };

  constructor(channel: Channel, redis: Redis) {
    this.channel = channel;
    this.redis = redis;
    this.analyticsRepository = new AnalyticsRepository();

    this.setupBatchProcessing();
    this.setupDataRetention();
    this.setupAggregationJobs();
  }

  private setupBatchProcessing(): void {
    setInterval(async () => {
      if (this.isProcessing) return;

      try {
        this.isProcessing = true;
        await this.processBatch();
      } catch (error) {
        logger.error('Error in batch processing:', error);
        createCustomMetric('analytics.batch.errors', 1);
      } finally {
        this.isProcessing = false;
      }
    }, this.config.processingInterval);
  }

  private async processBatch(): Promise<void> {
    const startTime = Date.now();
    let processedCount = 0;

    try {
      // Get batch of raw events
      const events = await this.redis.lrange(
        'analytics_batch_queue',
        0,
        this.config.batchSize - 1
      );
      if (events.length === 0) return;

      // Process events in chunks
      const chunks = this.chunkArray(events, 100);
      for (const chunk of chunks) {
        const analytics = await this.processEventChunk(chunk);
        if (analytics.length > 0) {
          await this.analyticsRepository.createMany(analytics);
          processedCount += analytics.length;
        }
      }

      // Remove processed events
      await this.redis.ltrim('analytics_batch_queue', events.length, -1);

      const duration = Date.now() - startTime;
      logger.info(
        `Batch processing completed: ${processedCount} events in ${duration}ms`
      );
      createCustomMetric('analytics.batch.processed', processedCount);
      createCustomMetric('analytics.batch.duration', duration);
    } catch (error) {
      logger.error('Error processing batch:', error);
      createCustomMetric('analytics.batch.errors', 1);
      throw error;
    }
  }

  private async processEventChunk(events: string[]): Promise<Analytics[]> {
    const analytics: Analytics[] = [];

    for (const eventStr of events) {
      try {
        const event = JSON.parse(eventStr);
        analytics.push({
          type: event.type,
          category: event.category,
          userId: event.userId,
          event: `${event.type}_${event.category}`.toLowerCase(),
          data: event.data,
          timestamp: new Date(event.timestamp),
          metrics: this.extractMetrics(event.data),
          session: event.session,
          source: event.source,
          platform: event.platform,
          version: event.version,
        } as Analytics);
      } catch (error) {
        logger.error('Error processing event:', { event: eventStr, error });
      }
    }

    return analytics;
  }

  private extractMetrics(data: Record<string, any>): Record<string, any> {
    const metrics: Record<string, any> = {
      count: 1,
    };

    if (typeof data.value === 'number') {
      metrics.value = data.value;
    }

    if (data.duration) {
      metrics.duration = data.duration;
    }

    if (data.custom) {
      metrics.custom = data.custom;
    }

    return metrics;
  }

  private setupDataRetention(): void {
    // Run retention cleanup daily
    setInterval(
      async () => {
        try {
          await this.cleanupOldData();
        } catch (error) {
          logger.error('Error in data retention cleanup:', error);
        }
      },
      24 * 60 * 60 * 1000
    );
  }

  private async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() - this.config.retentionPeriod * 1000
    );

    try {
      // Clean up raw events from Redis
      const keys = await this.redis.keys('raw_events:*');
      for (const key of keys) {
        const timestamp = parseInt(key.split(':')[2]);
        if (timestamp < cutoffDate.getTime()) {
          await this.redis.del(key);
        }
      }

      // Clean up old analytics data
      await this.analyticsRepository.delete({
        timestamp: LessThanOrEqual(cutoffDate),
      });

      logger.info('Data retention cleanup completed');
      createCustomMetric('analytics.retention.cleanup', 1);
    } catch (error) {
      logger.error('Error in data retention cleanup:', error);
      createCustomMetric('analytics.retention.errors', 1);
      throw error;
    }
  }

  private setupAggregationJobs(): void {
    // Hourly aggregation
    setInterval(() => {
      this.runAggregation('hourly').catch((error) =>
        logger.error('Error in hourly aggregation:', error)
      );
    }, this.config.aggregationWindows.hourly * 1000);

    // Daily aggregation
    setInterval(() => {
      this.runAggregation('daily').catch((error) =>
        logger.error('Error in daily aggregation:', error)
      );
    }, this.config.aggregationWindows.daily * 1000);

    // Weekly aggregation
    setInterval(() => {
      this.runAggregation('weekly').catch((error) =>
        logger.error('Error in weekly aggregation:', error)
      );
    }, this.config.aggregationWindows.weekly * 1000);

    // Monthly aggregation
    setInterval(() => {
      this.runAggregation('monthly').catch((error) =>
        logger.error('Error in monthly aggregation:', error)
      );
    }, this.config.aggregationWindows.monthly * 1000);
  }

  private async runAggregation(
    window: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    const now = new Date();
    const windowSize = this.config.aggregationWindows[window];
    const startTime = new Date(now.getTime() - windowSize * 1000);

    try {
      // Get analytics data for the window
      const analytics = await this.analyticsRepository.find({
        where: {
          timestamp: Between(startTime, now),
        },
      });

      // Group by type and category
      const groups = this.groupAnalytics(analytics);

      // Calculate aggregations for each group
      for (const [key, group] of Object.entries(groups)) {
        const [type, category] = key.split(':');
        const metrics = this.calculateAggregations(group);

        // Store aggregated metrics
        await this.storeAggregatedMetrics(
          type as AnalyticsType,
          category as AnalyticsCategory,
          window,
          metrics,
          startTime
        );
      }

      logger.info(`${window} aggregation completed`);
      createCustomMetric('analytics.aggregation.completed', 1, { window });
    } catch (error) {
      logger.error(`Error in ${window} aggregation:`, error);
      createCustomMetric('analytics.aggregation.errors', 1, { window });
    }
  }

  private groupAnalytics(analytics: Analytics[]): Record<string, Analytics[]> {
    const groups: Record<string, Analytics[]> = {};

    for (const analytic of analytics) {
      const key = `${analytic.type}:${analytic.category}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(analytic);
    }

    return groups;
  }

  private calculateAggregations(analytics: Analytics[]): AggregatedMetrics {
    const metrics: AggregatedMetrics = {
      count: analytics.length,
      sum: 0,
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
      avg: 0,
      distinctUsers: new Set(analytics.map((a) => a.userId).filter(Boolean))
        .size,
      metadata: {},
    };

    let valueCount = 0;
    for (const analytic of analytics) {
      if (analytic.metrics?.value !== undefined) {
        const value = analytic.metrics.value;
        metrics.sum += value;
        metrics.min = Math.min(metrics.min, value);
        metrics.max = Math.max(metrics.max, value);
        valueCount++;
      }

      // Aggregate custom metrics
      if (analytic.metrics?.custom) {
        for (const [key, value] of Object.entries(analytic.metrics.custom)) {
          if (!metrics.metadata[key]) {
            metrics.metadata[key] = { sum: 0, count: 0 };
          }
          metrics.metadata[key].sum += value;
          metrics.metadata[key].count++;
        }
      }
    }

    metrics.avg = valueCount > 0 ? metrics.sum / valueCount : 0;

    // Calculate averages for custom metrics
    for (const metric of Object.values(metrics.metadata)) {
      metric.avg = metric.count > 0 ? metric.sum / metric.count : 0;
    }

    return metrics;
  }

  private async storeAggregatedMetrics(
    type: AnalyticsType,
    category: AnalyticsCategory,
    window: string,
    metrics: AggregatedMetrics,
    timestamp: Date
  ): Promise<void> {
    const key = `aggregated:${window}:${type}:${category}:${timestamp.getTime()}`;

    await this.redis
      .multi()
      .hmset(key, {
        ...metrics,
        metadata: JSON.stringify(metrics.metadata),
      })
      .expire(key, this.config.retentionPeriod)
      .exec();
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async getAggregatedMetrics(
    type: AnalyticsType,
    category: AnalyticsCategory,
    window: 'hourly' | 'daily' | 'weekly' | 'monthly',
    startTime: Date,
    endTime: Date = new Date()
  ): Promise<AggregatedMetrics[]> {
    const pattern = `aggregated:${window}:${type}:${category}:*`;
    const keys = await this.redis.keys(pattern);
    const metrics: AggregatedMetrics[] = [];

    for (const key of keys) {
      const timestamp = parseInt(key.split(':')[4]);
      if (timestamp >= startTime.getTime() && timestamp <= endTime.getTime()) {
        const data = await this.redis.hgetall(key);
        if (data) {
          metrics.push({
            ...data,
            metadata: JSON.parse(data.metadata || '{}'),
          } as unknown as AggregatedMetrics);
        }
      }
    }

    return metrics;
  }
}
