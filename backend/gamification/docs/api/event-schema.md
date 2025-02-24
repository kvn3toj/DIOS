# Event System Documentation

## Overview
This document outlines the event-driven architecture of the Gamification service, including event types, message formats, and infrastructure configuration.

## Event Infrastructure

### RabbitMQ Configuration
```yaml
exchange:
  name: gamification
  type: topic
  durable: true

queues:
  achievement_events:
    name: achievement_events
    routing_key: achievement.*
    options:
      durable: true
  
  quest_events:
    name: quest_events
    routing_key: quest.*
    options:
      durable: true
  
  reward_events:
    name: reward_events
    routing_key: reward.*
    options:
      durable: true
  
  notification_events:
    name: notification_events
    routing_key: notification.*
    options:
      durable: true
  
  analytics_events:
    name: analytics_events
    routing_key: analytics.*
    options:
      durable: true
```

### Redis Configuration
```yaml
redis:
  host: ${REDIS_HOST}
  port: ${REDIS_PORT}
  password: ${REDIS_PASSWORD}
  db: ${REDIS_DB}
  
  caching:
    default_ttl: 300  # 5 minutes
    patterns:
      user_data: 600  # 10 minutes
      achievements: 1800  # 30 minutes
      analytics: 3600  # 1 hour
```

## Event Types and Formats

### Achievement Events
```typescript
interface AchievementEvent {
  type: 'achievement.created' | 'achievement.updated' | 'achievement.deleted' | 'achievement.completed' | 'achievement.progress_updated';
  data: {
    achievementId: string;
    userId?: string;
    name?: string;
    points?: number;
    progress?: number;
    completedAt?: string;
    metadata?: Record<string, any>;
  };
  metadata: EventMetadata;
}
```

### Quest Events
```typescript
interface QuestEvent {
  type: 'quest.created' | 'quest.updated' | 'quest.deleted' | 'quest.started' | 'quest.completed' | 'quest.progress_updated';
  data: {
    questId: string;
    userId?: string;
    name?: string;
    progress?: number;
    completedAt?: string;
    metadata?: Record<string, any>;
  };
  metadata: EventMetadata;
}
```

### Reward Events
```typescript
interface RewardEvent {
  type: 'reward.created' | 'reward.claimed' | 'reward.expired';
  data: {
    rewardId: string;
    userId: string;
    name: string;
    type: string;
    value: any;
    metadata?: Record<string, any>;
  };
  metadata: EventMetadata;
}
```

### Notification Events
```typescript
interface NotificationEvent {
  type: 'notification.created' | 'notification.read' | 'notification.archived';
  data: {
    notificationId: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    metadata?: Record<string, any>;
  };
  metadata: EventMetadata;
}
```

### Analytics Events
```typescript
interface AnalyticsEvent {
  type: 'analytics.event_tracked';
  data: {
    analyticsId: string;
    userId: string;
    type: string;
    category: string;
    event: string;
    value?: number;
    metadata?: Record<string, any>;
  };
  metadata: EventMetadata;
}
```

### Common Event Metadata
```typescript
interface EventMetadata {
  timestamp: string;
  correlationId?: string;
  userId?: string;
  source: string;
  version: string;
}
```

## Event Handling Patterns

### Publishing Events
```typescript
// Example of publishing an event
await publishEvent('achievement.completed', {
  achievementId: 'achievement-123',
  userId: 'user-456',
  name: 'Achievement Name',
  points: 100,
  completedAt: new Date().toISOString()
}, {
  correlationId: 'correlation-789'
});
```

### Event Retry Strategy
```yaml
retry:
  max_attempts: 3
  initial_delay: 1000  # 1 second
  max_delay: 60000    # 1 minute
  backoff_factor: 2   # Exponential backoff
```

### Dead Letter Queue
```yaml
dlx:
  exchange: gamification.dlx
  queue: failed_events
  routing_key: error.*
```

### Error Handling
```typescript
try {
  // Process event
} catch (error) {
  if (retryCount < MAX_RETRIES) {
    // Retry with exponential backoff
    await retry(async () => processEvent(event), {
      retries: MAX_RETRIES,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 60000
    });
  } else {
    // Move to dead letter queue
    await moveToDeadLetterQueue(event);
  }
}
```

## Event Monitoring

### Health Checks
```typescript
interface EventSystemHealth {
  rabbitMQ: {
    connected: boolean;
    queues: {
      name: string;
      messageCount: number;
      consumerCount: number;
    }[];
  };
  redis: {
    connected: boolean;
    usedMemory: string;
    hitRate: number;
  };
}
```

### Metrics
```typescript
interface EventMetrics {
  publishedEvents: number;
  consumedEvents: number;
  failedEvents: number;
  retryCount: number;
  processingTime: number;
  queueLength: number;
}
```

## Best Practices

1. Event Persistence
   - All events are persisted in RabbitMQ for reliability
   - Critical events are additionally logged to a database
   - Failed events are moved to a dead letter queue

2. Caching Strategy
   - Use Redis for caching frequently accessed data
   - Implement cache invalidation on relevant events
   - Use appropriate TTL for different data types

3. Error Handling
   - Implement retry mechanism with exponential backoff
   - Log failed events with detailed error information
   - Monitor dead letter queue for system health

4. Performance Optimization
   - Batch events when possible
   - Use appropriate prefetch values
   - Implement circuit breakers for external services

5. Security
   - Validate event payload schema
   - Implement proper authentication for event publishing
   - Encrypt sensitive data in events