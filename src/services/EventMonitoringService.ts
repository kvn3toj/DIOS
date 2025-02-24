import { Channel } from 'amqplib';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';
import { DeadLetterService } from './DeadLetterService';

interface QueueMetrics {
  messageCount: number;
  consumerCount: number;
  publishRate: number;
  consumeRate: number;
  errorRate: number;
  avgProcessingTime: number;
}

interface EventMetrics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  processingTime: number[];
  retryCount: number;
  deadLetterCount: number;
}

export class EventMonitoringService {
  private channel: Channel;
  private redis: Redis;
  private deadLetterService: DeadLetterService;
  private readonly metricsWindow: number = 60 * 1000; // 1 minute
  private readonly alertThresholds = {
    errorRate: 0.05, // 5% error rate
    processingTime: 1000, // 1 second
    queueSize: 1000, // 1000 messages
    deadLetterRate: 0.01, // 1% dead letter rate
    consumerLag: 100, // 100 messages
  };

  constructor(
    channel: Channel,
    redis: Redis,
    deadLetterService: DeadLetterService
  ) {
    this.channel = channel;
    this.redis = redis;
    this.deadLetterService = deadLetterService;

    this.setupMetricsCollection();
    this.setupHealthChecks();
    this.setupAlerts();
  }

  private setupMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        await this.processMetrics(metrics);
      } catch (error) {
        logger.error('Error collecting metrics:', error);
      }
    }, this.metricsWindow);
  }

  private setupHealthChecks(): void {
    // Run health checks every 30 seconds
    setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        logger.error('Error performing health checks:', error);
      }
    }, 30000);
  }

  private setupAlerts(): void {
    // Check for alert conditions every minute
    setInterval(async () => {
      try {
        await this.checkAlertConditions();
      } catch (error) {
        logger.error('Error checking alert conditions:', error);
      }
    }, 60000);
  }

  private async collectMetrics(): Promise<Record<string, QueueMetrics>> {
    const queues = [
      'achievement',
      'quest',
      'reward',
      'notification',
      'analytics',
    ];
    const metrics: Record<string, QueueMetrics> = {};

    for (const queue of queues) {
      const queueName = `${queue}_events`;
      try {
        const queueInfo = await this.channel.assertQueue(queueName);
        const eventMetrics = await this.getEventMetrics(queue);

        metrics[queueName] = {
          messageCount: queueInfo.messageCount,
          consumerCount: queueInfo.consumerCount,
          publishRate: await this.calculateRate(`${queue}:published`),
          consumeRate: await this.calculateRate(`${queue}:consumed`),
          errorRate: await this.calculateErrorRate(queue),
          avgProcessingTime: this.calculateAverageProcessingTime(
            eventMetrics.processingTime
          ),
        };

        // Record metrics
        this.recordQueueMetrics(queueName, metrics[queueName]);
      } catch (error) {
        logger.error(`Error collecting metrics for queue ${queueName}:`, error);
      }
    }

    return metrics;
  }

  private async getEventMetrics(eventType: string): Promise<EventMetrics> {
    const key = `metrics:${eventType}`;
    const data = await this.redis.hgetall(key);

    return {
      totalEvents: parseInt(data.totalEvents || '0'),
      successfulEvents: parseInt(data.successfulEvents || '0'),
      failedEvents: parseInt(data.failedEvents || '0'),
      processingTime: JSON.parse(data.processingTime || '[]'),
      retryCount: parseInt(data.retryCount || '0'),
      deadLetterCount: parseInt(data.deadLetterCount || '0'),
    };
  }

  private async calculateRate(key: string): Promise<number> {
    const counts = await this.redis.lrange(`${key}:history`, 0, -1);
    if (counts.length === 0) return 0;

    const total = counts.reduce((sum, count) => sum + parseInt(count), 0);
    return total / counts.length;
  }

  private async calculateErrorRate(eventType: string): Promise<number> {
    const metrics = await this.getEventMetrics(eventType);
    if (metrics.totalEvents === 0) return 0;
    return metrics.failedEvents / metrics.totalEvents;
  }

  private calculateAverageProcessingTime(times: number[]): number {
    if (times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  private recordQueueMetrics(queueName: string, metrics: QueueMetrics): void {
    createCustomMetric('event_system.queue.size', metrics.messageCount, {
      queue: queueName,
    });
    createCustomMetric('event_system.consumers', metrics.consumerCount, {
      queue: queueName,
    });
    createCustomMetric('event_system.publish_rate', metrics.publishRate, {
      queue: queueName,
    });
    createCustomMetric('event_system.consume_rate', metrics.consumeRate, {
      queue: queueName,
    });
    createCustomMetric('event_system.error_rate', metrics.errorRate, {
      queue: queueName,
    });
    createCustomMetric(
      'event_system.processing_time',
      metrics.avgProcessingTime,
      { queue: queueName }
    );
  }

  private async performHealthChecks(): Promise<void> {
    try {
      // Check RabbitMQ connection
      await this.channel.checkQueue('health_check');
      createCustomMetric('event_system.health.rabbitmq', 1);

      // Check Redis connection
      await this.redis.ping();
      createCustomMetric('event_system.health.redis', 1);

      // Check consumer health
      const consumerHealth = await this.checkConsumerHealth();
      createCustomMetric(
        'event_system.health.consumers',
        consumerHealth ? 1 : 0
      );

      // Check dead letter queues
      const dlqHealth = await this.checkDeadLetterQueues();
      createCustomMetric('event_system.health.dlq', dlqHealth ? 1 : 0);
    } catch (error) {
      logger.error('Health check failed:', error);
      createCustomMetric('event_system.health.status', 0);
    }
  }

  private async checkConsumerHealth(): Promise<boolean> {
    const queues = [
      'achievement',
      'quest',
      'reward',
      'notification',
      'analytics',
    ];

    for (const queue of queues) {
      const queueInfo = await this.channel.assertQueue(`${queue}_events`);
      if (queueInfo.consumerCount === 0) {
        logger.warn(`No consumers for queue ${queue}_events`);
        return false;
      }
    }

    return true;
  }

  private async checkDeadLetterQueues(): Promise<boolean> {
    const dlqMetrics = await this.deadLetterService.getQueueMetrics();
    const totalMessages = Object.values(dlqMetrics).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalMessages > this.alertThresholds.queueSize) {
      logger.warn(
        `High number of messages in dead letter queues: ${totalMessages}`
      );
      return false;
    }

    return true;
  }

  private async checkAlertConditions(): Promise<void> {
    const metrics = await this.collectMetrics();

    for (const [queueName, queueMetrics] of Object.entries(metrics)) {
      // Check error rate
      if (queueMetrics.errorRate > this.alertThresholds.errorRate) {
        this.triggerAlert('high_error_rate', {
          queue: queueName,
          errorRate: queueMetrics.errorRate,
          threshold: this.alertThresholds.errorRate,
        });
      }

      // Check processing time
      if (
        queueMetrics.avgProcessingTime > this.alertThresholds.processingTime
      ) {
        this.triggerAlert('high_processing_time', {
          queue: queueName,
          processingTime: queueMetrics.avgProcessingTime,
          threshold: this.alertThresholds.processingTime,
        });
      }

      // Check queue size
      if (queueMetrics.messageCount > this.alertThresholds.queueSize) {
        this.triggerAlert('queue_size_threshold_exceeded', {
          queue: queueName,
          size: queueMetrics.messageCount,
          threshold: this.alertThresholds.queueSize,
        });
      }

      // Check consumer lag
      const lag = queueMetrics.messageCount / queueMetrics.consumeRate;
      if (lag > this.alertThresholds.consumerLag) {
        this.triggerAlert('high_consumer_lag', {
          queue: queueName,
          lag,
          threshold: this.alertThresholds.consumerLag,
        });
      }
    }
  }

  private async triggerAlert(
    type: string,
    data: Record<string, any>
  ): Promise<void> {
    const alert = {
      type,
      data,
      timestamp: new Date().toISOString(),
      service: 'event_system',
    };

    // Log alert
    logger.warn('Event system alert:', alert);

    // Store alert in Redis for history
    const alertKey = `alerts:${type}:${Date.now()}`;
    await this.redis.setex(alertKey, 86400, JSON.stringify(alert)); // 24 hours retention

    // Create metric for the alert
    createCustomMetric('event_system.alert', 1, { type, queue: data.queue });

    // Publish alert event
    await this.channel.publish(
      'monitoring',
      'alerts',
      Buffer.from(JSON.stringify(alert)),
      { persistent: true }
    );
  }

  async getSystemStatus(): Promise<{
    health: Record<string, boolean>;
    metrics: Record<string, QueueMetrics>;
    alerts: Record<string, number>;
  }> {
    const [metrics, alertCounts] = await Promise.all([
      this.collectMetrics(),
      this.getRecentAlertCounts(),
    ]);

    return {
      health: {
        rabbitmq: await this.checkRabbitMQHealth(),
        redis: await this.checkRedisHealth(),
        consumers: await this.checkConsumerHealth(),
        deadLetterQueues: await this.checkDeadLetterQueues(),
      },
      metrics,
      alerts: alertCounts,
    };
  }

  private async checkRabbitMQHealth(): Promise<boolean> {
    try {
      await this.channel.checkQueue('health_check');
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  private async getRecentAlertCounts(): Promise<Record<string, number>> {
    const alertKeys = await this.redis.keys('alerts:*');
    const counts: Record<string, number> = {};

    for (const key of alertKeys) {
      const type = key.split(':')[1];
      counts[type] = (counts[type] || 0) + 1;
    }

    return counts;
  }
}
