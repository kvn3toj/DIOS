import { EventBus } from '../../config/eventBus';
import { createEvent, publishEvent, EventMetadata } from '../../utils/events';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { Quest, QuestType, QuestDifficulty } from '../../models/Quest';
import { Notification, NotificationType, NotificationPriority } from '../../models/Notification';
import { Reward, RewardType } from '../../models/Reward';
import { Analytics, AnalyticsType, AnalyticsCategory } from '../../models/Analytics';
import { logger } from '../../utils/logger';

// Mock Redis and RabbitMQ
jest.mock('ioredis');
jest.mock('amqplib');

describe('Event Handling System', () => {
  let eventBus: EventBus;
  let mockChannel: any;
  let mockConnection: any;
  let mockRedis: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockChannel = {
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      publish: jest.fn().mockReturnValue(true),
      consume: jest.fn(),
      ack: jest.fn(),
      reject: jest.fn(),
      close: jest.fn()
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn()
    };

    mockRedis = {
      lpush: jest.fn(),
      lrange: jest.fn(),
      keys: jest.fn(),
      del: jest.fn(),
      quit: jest.fn()
    };

    // Initialize event bus with test configuration
    eventBus = new EventBus({
      rabbitmq: {
        url: 'amqp://localhost',
        exchange: 'test-exchange',
        queues: {
          achievements: {
            name: 'test-achievement-events',
            routingKey: 'achievement.*',
            options: { durable: true }
          },
          quests: {
            name: 'test-quest-events',
            routingKey: 'quest.*',
            options: { durable: true }
          }
        }
      },
      redis: {
        host: 'localhost',
        port: 6379
      }
    });
  });

  describe('Event Bus Initialization', () => {
    it('should initialize successfully', async () => {
      await eventBus.initialize();

      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'test-exchange',
        'topic',
        { durable: true }
      );
      expect(mockChannel.assertQueue).toHaveBeenCalledTimes(2);
      expect(mockChannel.bindQueue).toHaveBeenCalledTimes(2);
    });

    it('should handle initialization errors', async () => {
      mockConnection.createChannel.mockRejectedValue(new Error('Connection failed'));

      await expect(eventBus.initialize()).rejects.toThrow('Connection failed');
    });
  });

  describe('Event Publishing', () => {
    beforeEach(async () => {
      await eventBus.initialize();
    });

    it('should publish achievement event successfully', async () => {
      const achievement: Partial<Achievement> = {
        id: 'test-id',
        name: 'Test Achievement',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON
      };

      await publishEvent('achievement:created', {
        achievementId: achievement.id,
        type: achievement.type,
        timestamp: new Date()
      });

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test-exchange',
        'achievement.created',
        expect.any(Buffer),
        expect.any(Object)
      );
    });

    it('should handle publishing errors', async () => {
      mockChannel.publish.mockReturnValue(false);

      const event = {
        type: 'test-event',
        data: { test: true }
      };

      await publishEvent('test:event', event);

      expect(mockRedis.lpush).toHaveBeenCalledWith(
        'failed_events:test.event',
        expect.any(String)
      );
    });
  });

  describe('Event Subscription', () => {
    let messageHandler: jest.Mock;

    beforeEach(async () => {
      messageHandler = jest.fn();
      await eventBus.initialize();
      await eventBus.subscribe('achievement.*', messageHandler);
    });

    it('should handle incoming messages', async () => {
      const message = {
        content: Buffer.from(JSON.stringify({ test: true })),
        properties: {},
        fields: { routingKey: 'achievement.created' }
      };

      // Simulate message consumption
      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      await consumeCallback(message);

      expect(messageHandler).toHaveBeenCalledWith({ test: true });
      expect(mockChannel.ack).toHaveBeenCalledWith(message);
    });

    it('should handle message processing errors', async () => {
      messageHandler.mockRejectedValue(new Error('Processing failed'));

      const message = {
        content: Buffer.from(JSON.stringify({ test: true })),
        properties: {},
        fields: { routingKey: 'achievement.created' }
      };

      // Simulate message consumption
      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      await consumeCallback(message);

      expect(mockChannel.reject).toHaveBeenCalledWith(message, true);
    });

    it('should handle invalid message format', async () => {
      const message = {
        content: Buffer.from('invalid json'),
        properties: {},
        fields: { routingKey: 'achievement.created' }
      };

      // Simulate message consumption
      const consumeCallback = mockChannel.consume.mock.calls[0][1];
      await consumeCallback(message);

      expect(mockChannel.reject).toHaveBeenCalledWith(message, false);
    });
  });

  describe('Failed Events Retry', () => {
    beforeEach(async () => {
      await eventBus.initialize();

      mockRedis.keys.mockResolvedValue(['failed_events:achievement.created']);
      mockRedis.lrange.mockResolvedValue([
        JSON.stringify({
          data: { test: true },
          timestamp: new Date().toISOString()
        })
      ]);
    });

    it('should retry failed events', async () => {
      await eventBus.retryFailedEvents();

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test-exchange',
        'achievement.created',
        expect.any(Buffer),
        expect.any(Object)
      );
      expect(mockRedis.del).toHaveBeenCalledWith('failed_events:achievement.created');
    });

    it('should handle retry errors', async () => {
      mockChannel.publish.mockImplementation(() => {
        throw new Error('Publish failed');
      });

      await expect(eventBus.retryFailedEvents()).rejects.toThrow('Publish failed');
    });
  });

  describe('Event Bus Shutdown', () => {
    beforeEach(async () => {
      await eventBus.initialize();
    });

    it('should close all connections', async () => {
      await eventBus.close();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
      expect(mockRedis.quit).toHaveBeenCalled();
    });

    it('should handle shutdown errors', async () => {
      mockChannel.close.mockRejectedValue(new Error('Close failed'));

      await expect(eventBus.close()).rejects.toThrow('Close failed');
    });
  });

  describe('Integration with Services', () => {
    beforeEach(async () => {
      await eventBus.initialize();
    });

    it('should handle achievement events', async () => {
      const achievementEvent = {
        type: 'achievement:completed',
        data: {
          userId: 'test-user',
          achievementId: 'test-achievement',
          timestamp: new Date()
        }
      };

      await publishEvent(achievementEvent.type, achievementEvent.data);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test-exchange',
        'achievement.completed',
        expect.any(Buffer),
        expect.any(Object)
      );
    });

    it('should handle quest events', async () => {
      const questEvent = {
        type: 'quest:completed',
        data: {
          userId: 'test-user',
          questId: 'test-quest',
          timestamp: new Date()
        }
      };

      await publishEvent(questEvent.type, questEvent.data);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test-exchange',
        'quest.completed',
        expect.any(Buffer),
        expect.any(Object)
      );
    });

    it('should handle notification events', async () => {
      const notificationEvent = {
        type: 'notification:created',
        data: {
          userId: 'test-user',
          notificationId: 'test-notification',
          type: NotificationType.ACHIEVEMENT,
          timestamp: new Date()
        }
      };

      await publishEvent(notificationEvent.type, notificationEvent.data);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test-exchange',
        'notification.created',
        expect.any(Buffer),
        expect.any(Object)
      );
    });

    it('should handle analytics events', async () => {
      const analyticsEvent = {
        type: 'analytics:event_tracked',
        data: {
          userId: 'test-user',
          type: AnalyticsType.USER_ACTION,
          category: AnalyticsCategory.ENGAGEMENT,
          timestamp: new Date()
        }
      };

      await publishEvent(analyticsEvent.type, analyticsEvent.data);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        'test-exchange',
        'analytics.event_tracked',
        expect.any(Buffer),
        expect.any(Object)
      );
    });
  });
}); 