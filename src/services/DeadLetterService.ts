import { Channel } from 'amqplib';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';
import { eventBus } from '../config/eventBus';

interface DeadLetteredMessage {
  id: string;
  routingKey: string;
  data: any;
  error: string;
  timestamp: number;
  attempts: number;
  headers?: Record<string, any>;
}

export class DeadLetterService {
  private channel: Channel;
  private redis: Redis;
  private readonly exchange: string;
  private readonly queues: Record<string, string>;
  private isProcessing: boolean = false;

  constructor(channel: Channel, redis: Redis, exchange: string) {
    this.channel = channel;
    this.redis = redis;
    this.exchange = exchange;
    this.queues = {};

    // Initialize DLQ names for each event type
    const eventTypes = [
      'achievement',
      'quest',
      'reward',
      'notification',
      'analytics',
    ];
    eventTypes.forEach((type) => {
      this.queues[type] = `${type}_events.dlq`;
    });

    this.setupPeriodicProcessing();
    this.setupMetrics();
  }

  private setupPeriodicProcessing(): void {
    // Process dead letters every 5 minutes
    setInterval(
      () => {
        if (!this.isProcessing) {
          this.processDeadLetters().catch((error) => {
            logger.error('Error processing dead letters:', error);
          });
        }
      },
      5 * 60 * 1000
    );
  }

  private setupMetrics(): void {
    // Track DLQ metrics every minute
    setInterval(async () => {
      try {
        const metrics = await this.getQueueMetrics();
        Object.entries(metrics).forEach(([queueName, count]) => {
          createCustomMetric('dead_letter.queue.size', count, {
            queue: queueName,
          });
        });
      } catch (error) {
        logger.error('Error tracking DLQ metrics:', error);
      }
    }, 60000);
  }

  async processDeadLetters(): Promise<void> {
    this.isProcessing = true;
    try {
      for (const [type, queueName] of Object.entries(this.queues)) {
        await this.processQueue(queueName);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processQueue(queueName: string): Promise<void> {
    try {
      // Get queue info
      const { messageCount } = await this.channel.assertQueue(queueName, {
        durable: true,
      });

      if (messageCount === 0) return;

      logger.info(`Processing ${messageCount} messages in ${queueName}`);
      createCustomMetric('dead_letter.processing.started', messageCount, {
        queue: queueName,
      });

      // Process messages in batches
      const batchSize = 10;
      let processedCount = 0;
      let failedCount = 0;

      while (processedCount < messageCount) {
        const messages = await this.consumeBatch(queueName, batchSize);

        for (const msg of messages) {
          try {
            const message: DeadLetteredMessage = JSON.parse(
              msg.content.toString()
            );

            // Store failed message for analysis
            await this.storeFailedMessage(message);

            // Check if message should be retried
            if (await this.shouldRetryMessage(message)) {
              await this.retryMessage(message);
              createCustomMetric('dead_letter.message.retried', 1, {
                queue: queueName,
              });
            } else {
              await this.archiveMessage(message);
              createCustomMetric('dead_letter.message.archived', 1, {
                queue: queueName,
              });
            }

            this.channel.ack(msg);
            processedCount++;
          } catch (error) {
            logger.error('Error processing dead letter:', error);
            this.channel.nack(msg, false, false);
            failedCount++;
            createCustomMetric('dead_letter.processing.error', 1, {
              queue: queueName,
            });
          }
        }
      }

      logger.info(
        `Processed ${processedCount} messages from ${queueName}, ${failedCount} failures`
      );
      createCustomMetric('dead_letter.processing.completed', 1, {
        queue: queueName,
        processed: processedCount,
        failed: failedCount,
      });
    } catch (error) {
      logger.error(`Error processing queue ${queueName}:`, error);
      createCustomMetric('dead_letter.queue.error', 1, { queue: queueName });
    }
  }

  private async consumeBatch(
    queueName: string,
    batchSize: number
  ): Promise<any[]> {
    const messages = [];
    for (let i = 0; i < batchSize; i++) {
      const msg = await this.channel.get(queueName, { noAck: false });
      if (!msg) break;
      messages.push(msg);
    }
    return messages;
  }

  private async storeFailedMessage(
    message: DeadLetteredMessage
  ): Promise<void> {
    const key = `failed_messages:${message.id}`;
    await this.redis.hmset(key, {
      ...message,
      data: JSON.stringify(message.data),
      storedAt: Date.now(),
    });
    await this.redis.expire(key, 30 * 24 * 60 * 60); // 30 days retention
  }

  private async shouldRetryMessage(
    message: DeadLetteredMessage
  ): Promise<boolean> {
    // Implement retry decision logic
    // Example: Retry if error is transient and not too old
    const isTransientError = this.isTransientError(message.error);
    const isRecent = Date.now() - message.timestamp < 24 * 60 * 60 * 1000; // 24 hours
    return isTransientError && isRecent;
  }

  private isTransientError(error: string): boolean {
    const transientErrors = [
      'ETIMEDOUT',
      'ECONNREFUSED',
      'ECONNRESET',
      'ESOCKETTIMEDOUT',
      'socket hang up',
      'network timeout',
      'Connection reset',
      'Connection closed',
      'Service unavailable',
      'Internal server error',
    ];
    return transientErrors.some((e) => error.includes(e));
  }

  private async retryMessage(message: DeadLetteredMessage): Promise<void> {
    try {
      // Publish to original exchange with original routing key
      await eventBus.publish(message.routingKey, message.data);
      logger.info(`Retried message ${message.id}`);
    } catch (error) {
      logger.error(`Failed to retry message ${message.id}:`, error);
      throw error;
    }
  }

  private async archiveMessage(message: DeadLetteredMessage): Promise<void> {
    const archiveKey = `archived_messages:${message.id}`;
    await this.redis.hmset(archiveKey, {
      ...message,
      data: JSON.stringify(message.data),
      archivedAt: Date.now(),
    });
    await this.redis.expire(archiveKey, 90 * 24 * 60 * 60); // 90 days retention
  }

  async getQueueMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    for (const [type, queueName] of Object.entries(this.queues)) {
      try {
        const { messageCount } = await this.channel.assertQueue(queueName, {
          durable: true,
        });
        metrics[queueName] = messageCount;
      } catch (error) {
        logger.error(`Error getting metrics for queue ${queueName}:`, error);
        metrics[queueName] = -1; // Indicate error
      }
    }

    return metrics;
  }

  async getFailedMessageStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byError: Record<string, number>;
  }> {
    const failedMessages = await this.redis.keys('failed_messages:*');
    const stats = {
      total: failedMessages.length,
      byType: {} as Record<string, number>,
      byError: {} as Record<string, number>,
    };

    for (const key of failedMessages) {
      const message = await this.redis.hgetall(key);
      if (message) {
        const type = message.routingKey.split('.')[0];
        const error = message.error;

        stats.byType[type] = (stats.byType[type] || 0) + 1;
        stats.byError[error] = (stats.byError[error] || 0) + 1;
      }
    }

    return stats;
  }

  async retryFailedMessagesByType(
    type: string,
    maxAge?: number
  ): Promise<number> {
    let retriedCount = 0;
    const failedMessages = await this.redis.keys('failed_messages:*');

    for (const key of failedMessages) {
      const message = await this.redis.hgetall(key);
      if (message && message.routingKey.startsWith(type)) {
        const messageAge = Date.now() - parseInt(message.timestamp);
        if (!maxAge || messageAge <= maxAge) {
          try {
            await this.retryMessage({
              ...message,
              data: JSON.parse(message.data),
            } as DeadLetteredMessage);
            await this.redis.del(key);
            retriedCount++;
          } catch (error) {
            logger.error(`Failed to retry message ${key}:`, error);
          }
        }
      }
    }

    return retriedCount;
  }

  async cleanup(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const now = Date.now();

      // Clean up failed messages
      const failedMessages = await this.redis.keys('failed_messages:*');
      for (const key of failedMessages) {
        const message = await this.redis.hgetall(key);
        if (message && now - parseInt(message.storedAt) > maxAge) {
          await this.redis.del(key);
        }
      }

      // Clean up archived messages
      const archivedMessages = await this.redis.keys('archived_messages:*');
      for (const key of archivedMessages) {
        const message = await this.redis.hgetall(key);
        if (message && now - parseInt(message.archivedAt) > maxAge) {
          await this.redis.del(key);
        }
      }

      logger.info('Dead letter cleanup completed');
    } catch (error) {
      logger.error('Error during dead letter cleanup:', error);
      throw error;
    }
  }
}
