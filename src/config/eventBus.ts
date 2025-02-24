import amqp, { Channel, Connection } from 'amqplib';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { createCustomMetric } from './monitoring';

interface EventBusConfig {
  rabbitmq: {
    url: string;
    exchange: string;
    queues: {
      [key: string]: {
        name: string;
        routingKey: string;
        options?: amqp.Options.AssertQueue;
      };
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  retry: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    resetTimeout: number;
  };
}

interface RetryState {
  attempt: number;
  nextRetry: number;
  error: Error;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

class EventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private redis: Redis;
  private readonly config: EventBusConfig;
  private readonly handlers: Map<string, Function[]> = new Map();
  private readonly retryStates: Map<string, RetryState> = new Map();
  private readonly circuitBreakers: Map<string, CircuitBreakerState> =
    new Map();

  constructor(config: EventBusConfig) {
    this.config = {
      ...config,
      retry: {
        maxAttempts: 5,
        initialDelay: 1000, // 1 second
        maxDelay: 60000, // 1 minute
        backoffFactor: 2,
        ...config.retry,
      },
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        ...config.circuitBreaker,
      },
    };
    this.redis = new Redis(config.redis);
  }

  async initialize(): Promise<void> {
    try {
      // Connect to RabbitMQ
      this.connection = await amqp.connect(this.config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      // Setup exchange
      await this.channel.assertExchange(
        this.config.rabbitmq.exchange,
        'topic',
        { durable: true }
      );

      // Setup queues
      for (const queue of Object.values(this.config.rabbitmq.queues)) {
        await this.channel.assertQueue(queue.name, {
          durable: true,
          deadLetterExchange: `${this.config.rabbitmq.exchange}.dlx`,
          ...queue.options,
        });
        await this.channel.bindQueue(
          queue.name,
          this.config.rabbitmq.exchange,
          queue.routingKey
        );
      }

      // Setup dead letter exchange and queues
      await this.setupDeadLetterQueues();

      // Setup event handlers
      await this.setupEventHandlers();

      // Start retry processor
      this.startRetryProcessor();

      logger.info('Event bus initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize event bus:', error);
      throw error;
    }
  }

  private async setupDeadLetterQueues(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    // Create dead letter exchange
    const dlxName = `${this.config.rabbitmq.exchange}.dlx`;
    await this.channel.assertExchange(dlxName, 'topic', { durable: true });

    // Create dead letter queues for each queue
    for (const queue of Object.values(this.config.rabbitmq.queues)) {
      const dlqName = `${queue.name}.dlq`;
      await this.channel.assertQueue(dlqName, { durable: true });
      await this.channel.bindQueue(dlqName, dlxName, queue.routingKey);
    }
  }

  async publish(routingKey: string, data: any): Promise<void> {
    const messageId = `${routingKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(routingKey)) {
        throw new Error('Circuit breaker is open');
      }

      if (!this.channel) {
        throw new Error('Channel not initialized');
      }

      const message = Buffer.from(JSON.stringify({ id: messageId, data }));
      const published = this.channel.publish(
        this.config.rabbitmq.exchange,
        routingKey,
        message,
        {
          persistent: true,
          messageId,
          timestamp: Date.now(),
          headers: {
            'x-retry-count': 0,
          },
        }
      );

      if (!published) {
        // If channel buffer is full, store in Redis for retry
        await this.storeForRetry(messageId, routingKey, data);
      }

      createCustomMetric('event_bus.publish.success', 1, { routingKey });
    } catch (error) {
      createCustomMetric('event_bus.publish.error', 1, { routingKey });
      await this.handlePublishError(
        messageId,
        routingKey,
        data,
        error as Error
      );
    }
  }

  private async storeForRetry(
    messageId: string,
    routingKey: string,
    data: any
  ): Promise<void> {
    const retryKey = `retry:${messageId}`;
    const retryState: RetryState = {
      attempt: 0,
      nextRetry: Date.now() + this.calculateBackoff(0),
      error: new Error('Channel buffer full'),
    };

    await this.redis
      .multi()
      .hmset(retryKey, {
        routingKey,
        data: JSON.stringify(data),
        state: JSON.stringify(retryState),
      })
      .expire(retryKey, 86400) // 24 hours TTL
      .exec();

    await this.redis.zadd('retry_queue', retryState.nextRetry, messageId);
  }

  private calculateBackoff(attempt: number): number {
    const delay = Math.min(
      this.config.retry.initialDelay *
        Math.pow(this.config.retry.backoffFactor, attempt),
      this.config.retry.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  private async handlePublishError(
    messageId: string,
    routingKey: string,
    data: any,
    error: Error
  ): Promise<void> {
    logger.error('Failed to publish event:', {
      messageId,
      routingKey,
      error: error.message,
    });

    // Update circuit breaker
    this.recordFailure(routingKey);

    // Store for retry
    await this.storeForRetry(messageId, routingKey, data);
  }

  private startRetryProcessor(): void {
    setInterval(async () => {
      try {
        await this.processRetryQueue();
      } catch (error) {
        logger.error('Error processing retry queue:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  private async processRetryQueue(): Promise<void> {
    const now = Date.now();
    const messages = await this.redis.zrangebyscore('retry_queue', 0, now);

    for (const messageId of messages) {
      try {
        const retryKey = `retry:${messageId}`;
        const [routingKey, data, stateStr] = await this.redis.hmget(
          retryKey,
          'routingKey',
          'data',
          'state'
        );

        if (!routingKey || !data || !stateStr) continue;

        const state: RetryState = JSON.parse(stateStr);
        const parsedData = JSON.parse(data);

        if (state.attempt >= this.config.retry.maxAttempts) {
          // Move to dead letter queue
          await this.moveToDeadLetterQueue(
            messageId,
            routingKey,
            parsedData,
            state.error
          );
          await this.cleanupRetryState(messageId);
          continue;
        }

        // Attempt retry
        if (!this.isCircuitBreakerOpen(routingKey)) {
          await this.publish(routingKey, parsedData);
          await this.cleanupRetryState(messageId);
        }
      } catch (error) {
        logger.error('Error processing retry message:', { messageId, error });
      }
    }
  }

  private async moveToDeadLetterQueue(
    messageId: string,
    routingKey: string,
    data: any,
    error: Error
  ): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    const dlqName = `${this.config.rabbitmq.queues[routingKey]?.name}.dlq`;
    const message = {
      id: messageId,
      data,
      error: error.message,
      timestamp: Date.now(),
      attempts: this.config.retry.maxAttempts,
    };

    await this.channel.publish(
      `${this.config.rabbitmq.exchange}.dlx`,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    createCustomMetric('event_bus.dead_letter', 1, { routingKey });
  }

  private async cleanupRetryState(messageId: string): Promise<void> {
    await this.redis
      .multi()
      .del(`retry:${messageId}`)
      .zrem('retry_queue', messageId)
      .exec();
  }

  // Circuit breaker methods
  private isCircuitBreakerOpen(routingKey: string): boolean {
    const state = this.circuitBreakers.get(routingKey);
    if (!state) return false;

    if (state.isOpen) {
      // Check if reset timeout has passed
      if (
        Date.now() - state.lastFailure >=
        this.config.circuitBreaker.resetTimeout
      ) {
        state.isOpen = false;
        state.failures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  private recordFailure(routingKey: string): void {
    let state = this.circuitBreakers.get(routingKey);
    if (!state) {
      state = { failures: 0, lastFailure: 0, isOpen: false };
      this.circuitBreakers.set(routingKey, state);
    }

    state.failures++;
    state.lastFailure = Date.now();

    if (state.failures >= this.config.circuitBreaker.failureThreshold) {
      state.isOpen = true;
      logger.warn('Circuit breaker opened for routing key:', routingKey);
      createCustomMetric('event_bus.circuit_breaker.open', 1, { routingKey });
    }
  }

  async subscribe(routingKey: string, handler: Function): Promise<void> {
    if (!this.handlers.has(routingKey)) {
      this.handlers.set(routingKey, []);
    }
    this.handlers.get(routingKey)?.push(handler);
  }

  private async setupEventHandlers(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    for (const queue of Object.values(this.config.rabbitmq.queues)) {
      await this.channel.consume(queue.name, async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());
          const handlers = this.handlers.get(queue.routingKey) || [];

          // Execute all handlers for this event
          await Promise.all(handlers.map((handler) => handler(data)));

          // Acknowledge message
          this.channel?.ack(msg);
          createCustomMetric('event_bus.consume.success', 1, {
            routingKey: queue.routingKey,
          });
        } catch (error) {
          logger.error('Failed to process message:', {
            queue: queue.name,
            error,
          });

          // Update retry count
          const retryCount = (msg.properties.headers['x-retry-count'] || 0) + 1;

          if (retryCount <= this.config.retry.maxAttempts) {
            // Reject and requeue with updated retry count
            msg.properties.headers['x-retry-count'] = retryCount;
            this.channel?.reject(msg, true);
            createCustomMetric('event_bus.consume.retry', 1, {
              routingKey: queue.routingKey,
            });
          } else {
            // Move to dead letter queue
            this.channel?.reject(msg, false);
            createCustomMetric('event_bus.consume.dead_letter', 1, {
              routingKey: queue.routingKey,
            });
          }
        }
      });
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      await this.redis.quit();
    } catch (error) {
      logger.error('Failed to close event bus:', error);
      throw error;
    }
  }
}

// Create and export event bus instance
export const eventBus = new EventBus({
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    exchange: 'gamification',
    queues: {
      achievements: {
        name: 'achievement_events',
        routingKey: 'achievement.*',
        options: { durable: true },
      },
      quests: {
        name: 'quest_events',
        routingKey: 'quest.*',
        options: { durable: true },
      },
      rewards: {
        name: 'reward_events',
        routingKey: 'reward.*',
        options: { durable: true },
      },
      notifications: {
        name: 'notification_events',
        routingKey: 'notification.*',
        options: { durable: true },
      },
      analytics: {
        name: 'analytics_events',
        routingKey: 'analytics.*',
        options: { durable: true },
      },
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  retry: {
    maxAttempts: parseInt(process.env.EVENT_RETRY_MAX_ATTEMPTS || '5'),
    initialDelay: parseInt(process.env.EVENT_RETRY_INITIAL_DELAY || '1000'),
    maxDelay: parseInt(process.env.EVENT_RETRY_MAX_DELAY || '60000'),
    backoffFactor: parseFloat(process.env.EVENT_RETRY_BACKOFF_FACTOR || '2'),
  },
  circuitBreaker: {
    failureThreshold: parseInt(
      process.env.EVENT_CIRCUIT_BREAKER_THRESHOLD || '5'
    ),
    resetTimeout: parseInt(process.env.EVENT_CIRCUIT_BREAKER_RESET || '60000'),
  },
});
