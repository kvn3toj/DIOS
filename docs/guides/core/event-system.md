# Event System Guide

## Overview
The event system in SuperApp and Gamifier 2.0 implements an event-driven architecture using Redis and RabbitMQ for reliable event distribution, with support for both synchronous and asynchronous event processing.

## Event Architecture

### Event Types
```typescript
interface BaseEvent {
  id: string;
  type: string;
  timestamp: Date;
  version: number;
  metadata: {
    correlationId: string;
    causationId?: string;
    userId?: string;
    source: string;
    environment: string;
  };
}

// Domain Events
interface DomainEvent extends BaseEvent {
  aggregateId: string;
  aggregateType: string;
  data: Record<string, any>;
}

// Integration Events
interface IntegrationEvent extends BaseEvent {
  service: string;
  action: string;
  payload: Record<string, any>;
}

// System Events
interface SystemEvent extends BaseEvent {
  level: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  message: string;
  details?: Record<string, any>;
}
```

### Event Bus Implementation
```typescript
interface EventBus {
  publish<T extends BaseEvent>(event: T): Promise<void>;
  subscribe<T extends BaseEvent>(
    pattern: string,
    handler: EventHandler<T>
  ): Promise<Subscription>;
  unsubscribe(subscription: Subscription): Promise<void>;
}

interface EventHandler<T extends BaseEvent> {
  handle(event: T): Promise<void>;
  filter?(event: T): boolean;
  errorHandler?(error: Error, event: T): Promise<void>;
  retryStrategy?: RetryStrategy;
}

interface RetryStrategy {
  maxAttempts: number;
  backoff: {
    type: 'fixed' | 'exponential';
    delay: number;
    maxDelay?: number;
  };
  deadLetter?: {
    enabled: boolean;
    exchange: string;
    routingKey: string;
  };
}

// Implementation example
class RedisPubSubEventBus implements EventBus {
  constructor(
    private readonly redis: Redis,
    private readonly logger: Logger,
    private readonly config: EventBusConfig
  ) {}

  async publish<T extends BaseEvent>(event: T): Promise<void> {
    const channel = this.getChannelForEvent(event);
    await this.redis.publish(channel, JSON.stringify(event));
    this.logger.debug(`Event published: ${event.type}`, { event });
  }

  async subscribe<T extends BaseEvent>(
    pattern: string,
    handler: EventHandler<T>
  ): Promise<Subscription> {
    const subscriber = this.redis.duplicate();
    await subscriber.psubscribe(pattern);

    subscriber.on('pmessage', async (pattern, channel, message) => {
      try {
        const event = JSON.parse(message) as T;
        if (handler.filter?.(event) ?? true) {
          await handler.handle(event);
        }
      } catch (error) {
        await this.handleError(error, handler, message);
      }
    });

    return { pattern, subscriber };
  }

  async unsubscribe(subscription: Subscription): Promise<void> {
    await subscription.subscriber.punsubscribe(subscription.pattern);
    await subscription.subscriber.quit();
  }
}
```

## Event Patterns

### Event Sourcing
```typescript
interface EventSourced<T extends BaseEvent> {
  id: string;
  version: number;
  changes: T[];
  
  apply(event: T): void;
  commit(): Promise<void>;
  loadFromHistory(events: T[]): void;
}

// Example implementation
abstract class EventSourcedAggregate<T extends DomainEvent> implements EventSourced<T> {
  id: string;
  version: number = 0;
  changes: T[] = [];

  protected constructor(id: string) {
    this.id = id;
  }

  abstract apply(event: T): void;

  protected addEvent(event: T): void {
    this.apply(event);
    this.changes.push(event);
    this.version++;
  }

  loadFromHistory(events: T[]): void {
    events.forEach(event => {
      this.apply(event);
      this.version = event.version;
    });
  }

  async commit(): Promise<void> {
    await eventStore.saveEvents(this.id, this.changes, this.version);
    this.changes = [];
  }
}
```

### CQRS Integration
```typescript
interface Command {
  id: string;
  type: string;
  payload: Record<string, any>;
  metadata: {
    userId?: string;
    timestamp: Date;
    correlationId: string;
  };
}

interface CommandHandler<T extends Command> {
  handle(command: T): Promise<void>;
  validate?(command: T): Promise<boolean>;
}

interface CommandBus {
  dispatch<T extends Command>(command: T): Promise<void>;
  register<T extends Command>(
    commandType: string,
    handler: CommandHandler<T>
  ): void;
}

// Example implementation
class EventDrivenCommandBus implements CommandBus {
  private handlers = new Map<string, CommandHandler<any>>();

  async dispatch<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type: ${command.type}`);
    }

    if (handler.validate && !(await handler.validate(command))) {
      throw new Error(`Command validation failed: ${command.type}`);
    }

    await handler.handle(command);
  }

  register<T extends Command>(
    commandType: string,
    handler: CommandHandler<T>
  ): void {
    this.handlers.set(commandType, handler);
  }
}
```

## Event Stores

### Redis Event Store
```typescript
interface EventStore {
  saveEvents(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void>;
  getEvents(
    streamId: string,
    fromVersion?: number
  ): Promise<DomainEvent[]>;
  getAllEvents(
    fromPosition?: number,
    batchSize?: number
  ): Promise<DomainEvent[]>;
}

// Implementation example
class RedisEventStore implements EventStore {
  constructor(
    private readonly redis: Redis,
    private readonly config: EventStoreConfig
  ) {}

  async saveEvents(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const key = `events:${streamId}`;
    const multi = this.redis.multi();

    // Optimistic concurrency check
    const currentVersion = await this.redis.get(`${key}:version`);
    if (parseInt(currentVersion ?? '0') !== expectedVersion) {
      throw new Error('Concurrency conflict');
    }

    events.forEach((event, index) => {
      const version = expectedVersion + index + 1;
      multi.zadd(key, version, JSON.stringify({ ...event, version }));
    });

    multi.set(`${key}:version`, expectedVersion + events.length);
    await multi.exec();
  }

  async getEvents(
    streamId: string,
    fromVersion: number = 0
  ): Promise<DomainEvent[]> {
    const key = `events:${streamId}`;
    const events = await this.redis.zrangebyscore(key, fromVersion, '+inf');
    return events.map(e => JSON.parse(e));
  }

  async getAllEvents(
    fromPosition: number = 0,
    batchSize: number = 100
  ): Promise<DomainEvent[]> {
    const keys = await this.redis.keys('events:*');
    const events: DomainEvent[] = [];

    for (const key of keys) {
      const streamEvents = await this.redis.zrangebyscore(
        key,
        fromPosition,
        '+inf',
        'LIMIT',
        0,
        batchSize
      );
      events.push(...streamEvents.map(e => JSON.parse(e)));
    }

    return events.sort((a, b) => a.version - b.version);
  }
}
```

## Event Monitoring

### Event Tracking
```typescript
interface EventTracker {
  track(event: BaseEvent): Promise<void>;
  getStats(filter: EventStatsFilter): Promise<EventStats>;
  getLatency(eventType: string): Promise<number>;
}

interface EventStats {
  total: number;
  byType: Record<string, number>;
  failureRate: number;
  averageLatency: number;
  timeDistribution: {
    p50: number;
    p90: number;
    p99: number;
  };
}

// Implementation example
class PrometheusEventTracker implements EventTracker {
  private readonly eventCounter: Counter;
  private readonly eventLatency: Histogram;

  constructor() {
    this.eventCounter = new Counter({
      name: 'events_total',
      help: 'Total number of events',
      labelNames: ['type', 'status']
    });

    this.eventLatency = new Histogram({
      name: 'event_latency_seconds',
      help: 'Event processing latency',
      labelNames: ['type'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });
  }

  async track(event: BaseEvent): Promise<void> {
    this.eventCounter.inc({ type: event.type, status: 'processed' });
    this.eventLatency.observe(
      { type: event.type },
      Date.now() - event.timestamp.getTime()
    );
  }

  // Implementation of other methods...
}
```

## Configuration

### Development Environment
```env
# Redis Event Store
REDIS_EVENT_STORE_HOST=localhost
REDIS_EVENT_STORE_PORT=6379
REDIS_EVENT_STORE_DB=1

# RabbitMQ Event Bus
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/

# Event Configuration
EVENT_RETRY_MAX_ATTEMPTS=3
EVENT_RETRY_DELAY=1000
EVENT_DEAD_LETTER_ENABLED=true
EVENT_TRACKING_ENABLED=true
```

### Production Environment
```env
# Redis Event Store
REDIS_EVENT_STORE_HOST=redis.production.com
REDIS_EVENT_STORE_PORT=6379
REDIS_EVENT_STORE_PASSWORD=strong-password
REDIS_EVENT_STORE_DB=1

# RabbitMQ Event Bus
RABBITMQ_HOST=rabbitmq.production.com
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=app
RABBITMQ_PASSWORD=secure-password
RABBITMQ_VHOST=/prod

# Event Configuration
EVENT_RETRY_MAX_ATTEMPTS=5
EVENT_RETRY_DELAY=2000
EVENT_DEAD_LETTER_ENABLED=true
EVENT_TRACKING_ENABLED=true
```

## Related Guides
- [Core Architecture](architecture.md)
- [State Management](state-management.md)
- [Message Queue](../infrastructure/message-queue.md)
- [Monitoring](../infrastructure/monitoring.md) 