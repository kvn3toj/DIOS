import { Channel } from 'amqplib';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import {
  Analytics,
  AnalyticsType,
  AnalyticsCategory,
} from '../models/Analytics';

interface AnalyticsEvent {
  type: AnalyticsType;
  category: AnalyticsCategory;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

interface WindowedMetric {
  count: number;
  sum: number;
  min: number;
  max: number;
  lastUpdate: number;
}

export class RealTimeAnalyticsService {
  private channel: Channel;
  private redis: Redis;
  private analyticsRepository: AnalyticsRepository;
  private readonly windowSize: number = 60; // 1 minute windows
  private readonly retentionPeriod: number = 24 * 60 * 60; // 24 hours in seconds
  private readonly batchSize: number = 100;
  private readonly processingInterval: number = 1000; // 1 second

  constructor(channel: Channel, redis: Redis) {
    this.channel = channel;
    this.redis = redis;
    this.analyticsRepository = new AnalyticsRepository();

    this.setupEventConsumers();
    this.setupMetricAggregation();
    this.setupDataPersistence();
  }

  private setupEventConsumers(): void {
    // Subscribe to analytics events
    this.channel
      .assertQueue('analytics_events', { durable: true })
      .then(() => {
        this.channel.consume('analytics_events', async (msg) => {
          if (!msg) return;

          try {
            const event: AnalyticsEvent = JSON.parse(msg.content.toString());
            await this.processEvent(event);
            this.channel.ack(msg);
          } catch (error) {
            logger.error('Error processing analytics event:', error);
            // Reject and requeue if it's a processing error
            this.channel.reject(
              msg,
              error instanceof SyntaxError ? false : true
            );
          }
        });
      })
      .catch((error) =>
        logger.error('Error setting up analytics queue:', error)
      );
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store raw event
      await this.storeRawEvent(event);

      // Update real-time metrics
      await this.updateMetrics(event);

      // Update user-specific metrics if userId is present
      if (event.userId) {
        await this.updateUserMetrics(event);
      }

      // Emit real-time updates
      await this.emitRealtimeUpdate(event);

      createCustomMetric('analytics.events.processed', 1, {
        type: event.type,
        category: event.category,
      });
    } catch (error) {
      logger.error('Error in event processing:', error);
      createCustomMetric('analytics.events.errors', 1, {
        type: event.type,
        category: event.category,
      });
      throw error;
    }
  }

  private async storeRawEvent(event: AnalyticsEvent): Promise<void> {
    const key = `raw_events:${event.type}:${Date.now()}`;
    await this.redis.setex(key, this.retentionPeriod, JSON.stringify(event));
  }

  private async updateMetrics(event: AnalyticsEvent): Promise<void> {
    const timestamp = Math.floor(Date.now() / (this.windowSize * 1000));
    const baseKey = `metrics:${event.type}:${event.category}:${timestamp}`;

    // Update count
    await this.redis.hincrby(baseKey, 'count', 1);

    // Update value metrics if present
    if (typeof event.data.value === 'number') {
      const metric = await this.getOrCreateMetric(baseKey);
      metric.count++;
      metric.sum += event.data.value;
      metric.min = Math.min(metric.min, event.data.value);
      metric.max = Math.max(metric.max, event.data.value);
      metric.lastUpdate = Date.now();

      await this.redis.hmset(baseKey, metric);
    }

    // Set expiration
    await this.redis.expire(baseKey, this.retentionPeriod);
  }

  private async getOrCreateMetric(key: string): Promise<WindowedMetric> {
    const data = await this.redis.hgetall(key);
    if (Object.keys(data).length === 0) {
      return {
        count: 0,
        sum: 0,
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
        lastUpdate: Date.now(),
      };
    }

    return {
      count: parseInt(data.count || '0'),
      sum: parseFloat(data.sum || '0'),
      min: parseFloat(data.min || '0'),
      max: parseFloat(data.max || '0'),
      lastUpdate: parseInt(data.lastUpdate || '0'),
    };
  }

  private async updateUserMetrics(event: AnalyticsEvent): Promise<void> {
    if (!event.userId) return;

    const userKey = `user_metrics:${event.userId}:${event.type}`;
    const timestamp = Date.now();

    // Update user's event history
    await this.redis.zadd(
      `${userKey}:history`,
      timestamp,
      JSON.stringify({ ...event, timestamp })
    );

    // Maintain history size
    await this.redis.zremrangebyrank(
      `${userKey}:history`,
      0,
      -101 // Keep last 100 events
    );

    // Update user's aggregate metrics
    await this.redis.hincrby(`${userKey}:aggregates`, 'total_events', 1);
    if (typeof event.data.value === 'number') {
      await this.redis.hincrbyfloat(
        `${userKey}:aggregates`,
        'total_value',
        event.data.value
      );
    }

    // Set expiration
    await this.redis.expire(`${userKey}:history`, this.retentionPeriod);
    await this.redis.expire(`${userKey}:aggregates`, this.retentionPeriod);
  }

  private async emitRealtimeUpdate(event: AnalyticsEvent): Promise<void> {
    const update = {
      type: event.type,
      category: event.category,
      timestamp: Date.now(),
      data: event.data,
    };

    await this.channel.publish(
      'analytics',
      'realtime_updates',
      Buffer.from(JSON.stringify(update)),
      { persistent: true }
    );
  }

  private setupMetricAggregation(): void {
    setInterval(async () => {
      try {
        await this.aggregateMetrics();
      } catch (error) {
        logger.error('Error in metric aggregation:', error);
      }
    }, this.processingInterval);
  }

  private async aggregateMetrics(): Promise<void> {
    const currentTimestamp = Math.floor(Date.now() / (this.windowSize * 1000));
    const aggregationKey = `aggregated_metrics:${currentTimestamp}`;

    // Get all metric keys for the current window
    const keys = await this.redis.keys('metrics:*:*:' + currentTimestamp);

    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.hgetall(key);
    }

    const results = await pipeline.exec();
    if (!results) return;

    // Aggregate metrics by type and category
    const aggregates: Record<string, WindowedMetric> = {};

    results.forEach((result, index) => {
      if (!result || !result[1]) return;

      const [, metrics] = result;
      const [, type, category] = keys[index].split(':');
      const key = `${type}:${category}`;

      if (!aggregates[key]) {
        aggregates[key] = {
          count: 0,
          sum: 0,
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          lastUpdate: Date.now(),
        };
      }

      const metric = aggregates[key];
      metric.count += parseInt(metrics.count || '0');
      metric.sum += parseFloat(metrics.sum || '0');
      metric.min = Math.min(metric.min, parseFloat(metrics.min || 'Infinity'));
      metric.max = Math.max(metric.max, parseFloat(metrics.max || '-Infinity'));
    });

    // Store aggregated metrics
    if (Object.keys(aggregates).length > 0) {
      await this.redis
        .multi()
        .hmset(aggregationKey, aggregates)
        .expire(aggregationKey, this.retentionPeriod)
        .exec();
    }
  }

  private setupDataPersistence(): void {
    setInterval(async () => {
      try {
        await this.persistAnalytics();
      } catch (error) {
        logger.error('Error persisting analytics:', error);
      }
    }, this.processingInterval * 10); // Every 10 seconds
  }

  private async persistAnalytics(): Promise<void> {
    const events = await this.redis.lrange(
      'analytics_events_to_persist',
      0,
      this.batchSize - 1
    );
    if (events.length === 0) return;

    const analytics: Analytics[] = [];
    for (const eventStr of events) {
      try {
        const event: AnalyticsEvent = JSON.parse(eventStr);
        analytics.push({
          type: event.type,
          category: event.category,
          userId: event.userId,
          event: `${event.type}_${event.category}`.toLowerCase(),
          data: event.data,
          timestamp: event.timestamp,
          metrics: {
            value: event.data.value,
            count: 1,
          },
        } as Analytics);
      } catch (error) {
        logger.error('Error parsing event for persistence:', error);
      }
    }

    if (analytics.length > 0) {
      try {
        await this.analyticsRepository.createMany(analytics);
        await this.redis.ltrim(
          'analytics_events_to_persist',
          events.length,
          -1
        );
        createCustomMetric('analytics.events.persisted', analytics.length);
      } catch (error) {
        logger.error('Error persisting analytics batch:', error);
        createCustomMetric('analytics.persistence.errors', 1);
      }
    }
  }

  async getRealtimeMetrics(
    type: AnalyticsType,
    category: AnalyticsCategory
  ): Promise<WindowedMetric> {
    const currentTimestamp = Math.floor(Date.now() / (this.windowSize * 1000));
    const key = `metrics:${type}:${category}:${currentTimestamp}`;
    return await this.getOrCreateMetric(key);
  }

  async getUserMetrics(
    userId: string,
    type: AnalyticsType
  ): Promise<{
    recentEvents: AnalyticsEvent[];
    aggregates: Record<string, number>;
  }> {
    const userKey = `user_metrics:${userId}:${type}`;

    const [events, aggregates] = await Promise.all([
      this.redis.zrange(`${userKey}:history`, 0, -1),
      this.redis.hgetall(`${userKey}:aggregates`),
    ]);

    return {
      recentEvents: events.map((e) => JSON.parse(e)),
      aggregates: {
        totalEvents: parseInt(aggregates.total_events || '0'),
        totalValue: parseFloat(aggregates.total_value || '0'),
      },
    };
  }
}
