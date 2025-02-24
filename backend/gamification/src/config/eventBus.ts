import amqp, { Channel, Connection } from 'amqplib';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

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
}

class EventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private redis: Redis;
  private readonly config: EventBusConfig;
  private readonly handlers: Map<string, Function[]> = new Map();

  constructor(config: EventBusConfig) {
    this.config = config;
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
        await this.channel.assertQueue(queue.name, queue.options);
        await this.channel.bindQueue(
          queue.name,
          this.config.rabbitmq.exchange,
          queue.routingKey
        );
      }

      // Setup event handlers
      await this.setupEventHandlers();

      logger.info('Event bus initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize event bus:', error);
      throw error;
    }
  }

  async publish(routingKey: string, data: any): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error('Channel not initialized');
      }

      const message = Buffer.from(JSON.stringify(data));
      const published = this.channel.publish(
        this.config.rabbitmq.exchange,
        routingKey,
        message,
        { persistent: true }
      );

      if (!published) {
        // If channel buffer is full, store in Redis for retry
        await this.redis.lpush(
          `failed_events:${routingKey}`,
          JSON.stringify({ data, timestamp: new Date() })
        );
      }
    } catch (error) {
      logger.error('Failed to publish event:', { routingKey, data, error });
      throw error;
    }
  }

  async subscribe(routingKey: string, handler: Function): Promise<void> {
    if (!this.handlers.has(routingKey)) {
      this.handlers.set(routingKey, []);
    }
    this.handlers.get(routingKey)?.push(handler);
  }

  private async setupEventHandlers(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    for (const queue of Object.values(this.config.rabbitmq.queues)) {
      await this.channel.consume(queue.name, async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());
          const handlers = this.handlers.get(queue.routingKey) || [];

          // Execute all handlers for this event
          await Promise.all(
            handlers.map(handler => handler(data))
          );

          // Acknowledge message
          this.channel?.ack(msg);
        } catch (error) {
          logger.error('Failed to process message:', {
            queue: queue.name,
            error
          });

          // Reject message and requeue if it's not a parsing error
          this.channel?.reject(msg, error instanceof SyntaxError ? false : true);
        }
      });
    }
  }

  async retryFailedEvents(): Promise<void> {
    try {
      // Get all failed event queues
      const keys = await this.redis.keys('failed_events:*');

      for (const key of keys) {
        const routingKey = key.split(':')[1];
        const events = await this.redis.lrange(key, 0, -1);

        for (const event of events) {
          const { data } = JSON.parse(event);
          await this.publish(routingKey, data);
        }

        // Clear processed events
        await this.redis.del(key);
      }
    } catch (error) {
      logger.error('Failed to retry events:', error);
      throw error;
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
        options: { durable: true }
      },
      quests: {
        name: 'quest_events',
        routingKey: 'quest.*',
        options: { durable: true }
      },
      rewards: {
        name: 'reward_events',
        routingKey: 'reward.*',
        options: { durable: true }
      },
      notifications: {
        name: 'notification_events',
        routingKey: 'notification.*',
        options: { durable: true }
      },
      analytics: {
        name: 'analytics_events',
        routingKey: 'analytics.*',
        options: { durable: true }
      }
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  }
}); 