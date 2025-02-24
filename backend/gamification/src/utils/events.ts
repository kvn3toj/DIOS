import { eventBus } from '../config/eventBus';
import { logger } from './logger';

export interface EventMetadata {
  timestamp: string;
  correlationId?: string;
  userId?: string;
  source: string;
  version: string;
}

export interface Event<T = any> {
  type: string;
  data: T;
  metadata: EventMetadata;
}

export const createEvent = <T>(
  type: string,
  data: T,
  metadata: Partial<EventMetadata> = {}
): Event<T> => ({
  type,
  data,
  metadata: {
    timestamp: new Date().toISOString(),
    source: 'gamification-service',
    version: '1.0',
    ...metadata
  }
});

export const publishEvent = async <T>(
  type: string,
  data: T,
  metadata: Partial<EventMetadata> = {}
): Promise<void> => {
  try {
    const event = createEvent(type, data, metadata);
    const routingKey = type.replace(':', '.');

    await eventBus.publish(routingKey, event);

    logger.debug('Event published:', {
      type,
      routingKey,
      metadata: event.metadata
    });
  } catch (error) {
    logger.error('Failed to publish event:', {
      type,
      data,
      error
    });
    throw error;
  }
};

// Event type definitions
export interface AchievementEvent {
  achievementId: string;
  userId?: string;
  type: 'created' | 'updated' | 'deleted' | 'completed' | 'progress_updated';
  data: {
    name?: string;
    points?: number;
    progress?: number;
    completedAt?: string;
    [key: string]: any;
  };
}

export interface QuestEvent {
  questId: string;
  userId?: string;
  type: 'created' | 'updated' | 'deleted' | 'started' | 'completed' | 'progress_updated';
  data: {
    name?: string;
    progress?: number;
    completedAt?: string;
    [key: string]: any;
  };
}

export interface RewardEvent {
  rewardId: string;
  userId: string;
  type: 'created' | 'claimed' | 'expired';
  data: {
    name: string;
    type: string;
    value: any;
    [key: string]: any;
  };
}

export interface NotificationEvent {
  notificationId: string;
  userId: string;
  type: 'created' | 'read' | 'archived';
  data: {
    title: string;
    message: string;
    type: string;
    [key: string]: any;
  };
}

// Event publishers
export const publishAchievementEvent = async (
  event: AchievementEvent,
  metadata: Partial<EventMetadata> = {}
): Promise<void> => {
  await publishEvent(`achievement:${event.type}`, event.data, {
    ...metadata,
    userId: event.userId
  });
};

export const publishQuestEvent = async (
  event: QuestEvent,
  metadata: Partial<EventMetadata> = {}
): Promise<void> => {
  await publishEvent(`quest:${event.type}`, event.data, {
    ...metadata,
    userId: event.userId
  });
};

export const publishRewardEvent = async (
  event: RewardEvent,
  metadata: Partial<EventMetadata> = {}
): Promise<void> => {
  await publishEvent(`reward:${event.type}`, event.data, {
    ...metadata,
    userId: event.userId
  });
};

export const publishNotificationEvent = async (
  event: NotificationEvent,
  metadata: Partial<EventMetadata> = {}
): Promise<void> => {
  await publishEvent(`notification:${event.type}`, event.data, {
    ...metadata,
    userId: event.userId
  });
}; 