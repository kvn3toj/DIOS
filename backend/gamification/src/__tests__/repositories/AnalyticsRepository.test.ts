import { AnalyticsRepository } from '../../repositories/AnalyticsRepository';
import { Analytics, AnalyticsType, AnalyticsCategory } from '../../models/Analytics';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';

describe('AnalyticsRepository', () => {
  let repository: AnalyticsRepository;
  let testUser: User;
  let testAnalytics: Analytics;

  beforeEach(async () => {
    repository = new AnalyticsRepository();
    testUser = await global.createTestUser();
    testAnalytics = await repository.create({
      userId: testUser.id,
      type: AnalyticsType.USER_ACTION,
      category: AnalyticsCategory.ENGAGEMENT,
      event: 'test_event',
      data: {
        value: 100,
        metadata: { test: 'data' }
      },
      metrics: {
        duration: 1000,
        count: 1
      },
      timestamp: new Date(),
      source: 'test',
      platform: 'web',
      version: '1.0'
    });
  });

  describe('create', () => {
    it('should create a new analytics record', async () => {
      const data = {
        userId: testUser.id,
        type: AnalyticsType.ACHIEVEMENT,
        category: AnalyticsCategory.PROGRESSION,
        event: 'achievement_unlocked',
        data: {
          value: 1,
          metadata: { achievementId: 'test-id' }
        },
        metrics: {
          duration: 0,
          count: 1,
          value: 100
        },
        timestamp: new Date(),
        source: 'game',
        platform: 'mobile',
        version: '1.0',
        session: {
          id: 'test-session',
          startTime: new Date()
        }
      };

      const analytics = await repository.create(data);

      expect(analytics).toBeDefined();
      expect(analytics.id).toBeDefined();
      expect(analytics.userId).toBe(data.userId);
      expect(analytics.type).toBe(data.type);
      expect(analytics.category).toBe(data.category);
      expect(analytics.event).toBe(data.event);
      expect(analytics.data).toEqual(data.data);
      expect(analytics.metrics).toEqual(data.metrics);
      expect(analytics.source).toBe(data.source);
      expect(analytics.platform).toBe(data.platform);
      expect(analytics.version).toBe(data.version);
      expect(analytics.session).toEqual(data.session);
      expect(analytics.createdAt).toBeDefined();
      expect(analytics.updatedAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find analytics by id', async () => {
      const analytics = await repository.findById(testAnalytics.id);

      expect(analytics).toBeDefined();
      expect(analytics?.id).toBe(testAnalytics.id);
    });

    it('should return null for non-existent id', async () => {
      const analytics = await repository.findById('non-existent-id');

      expect(analytics).toBeNull();
    });
  });

  describe('findByUser', () => {
    beforeEach(async () => {
      // Create additional analytics records
      await repository.create({
        userId: testUser.id,
        type: AnalyticsType.QUEST,
        category: AnalyticsCategory.PROGRESSION,
        event: 'quest_completed',
        data: { value: 1 },
        metrics: { count: 1 },
        timestamp: new Date()
      });

      await repository.create({
        userId: testUser.id,
        type: AnalyticsType.REWARD,
        category: AnalyticsCategory.MONETIZATION,
        event: 'reward_claimed',
        data: { value: 100 },
        metrics: { value: 100 },
        timestamp: new Date()
      });
    });

    it('should find all analytics for user', async () => {
      const analytics = await repository.findByUser(testUser.id);

      expect(analytics.length).toBe(3);
      analytics.forEach(a => {
        expect(a.userId).toBe(testUser.id);
      });
    });

    it('should find analytics with relations', async () => {
      const analytics = await repository.findByUser(testUser.id, ['user']);

      expect(analytics.length).toBeGreaterThan(0);
      analytics.forEach(a => {
        expect(a.user).toBeDefined();
        expect(a.user.id).toBe(a.userId);
      });
    });
  });

  describe('findByType', () => {
    it('should find analytics by type', async () => {
      const analytics = await repository.findByType(AnalyticsType.USER_ACTION);

      expect(analytics.length).toBeGreaterThan(0);
      analytics.forEach(a => {
        expect(a.type).toBe(AnalyticsType.USER_ACTION);
      });
    });
  });

  describe('findByCategory', () => {
    it('should find analytics by category', async () => {
      const analytics = await repository.findByCategory(AnalyticsCategory.ENGAGEMENT);

      expect(analytics.length).toBeGreaterThan(0);
      analytics.forEach(a => {
        expect(a.category).toBe(AnalyticsCategory.ENGAGEMENT);
      });
    });
  });

  describe('findByTimeRange', () => {
    beforeEach(async () => {
      // Create analytics with different timestamps
      const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      await repository.create({
        userId: testUser.id,
        type: AnalyticsType.SYSTEM,
        category: AnalyticsCategory.PERFORMANCE,
        event: 'past_event',
        data: { value: 1 },
        timestamp: pastDate
      });

      await repository.create({
        userId: testUser.id,
        type: AnalyticsType.SYSTEM,
        category: AnalyticsCategory.PERFORMANCE,
        event: 'future_event',
        data: { value: 1 },
        timestamp: futureDate
      });
    });

    it('should find analytics within time range', async () => {
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

      const analytics = await repository.findByTimeRange(startTime, endTime);

      expect(analytics.length).toBeGreaterThan(0);
      analytics.forEach(a => {
        expect(a.timestamp.getTime()).toBeGreaterThanOrEqual(startTime.getTime());
        expect(a.timestamp.getTime()).toBeLessThanOrEqual(endTime.getTime());
      });
    });
  });

  describe('findByEvent', () => {
    it('should find analytics by event', async () => {
      const analytics = await repository.findByEvent('test_event');

      expect(analytics.length).toBeGreaterThan(0);
      analytics.forEach(a => {
        expect(a.event).toBe('test_event');
      });
    });
  });

  describe('findBySession', () => {
    beforeEach(async () => {
      // Create analytics with session data
      await repository.create({
        userId: testUser.id,
        type: AnalyticsType.USER_ACTION,
        category: AnalyticsCategory.ENGAGEMENT,
        event: 'session_event',
        data: { value: 1 },
        timestamp: new Date(),
        session: {
          id: 'test-session',
          startTime: new Date(),
          duration: 3600
        }
      });
    });

    it('should find analytics by session id', async () => {
      const analytics = await repository.findBySession('test-session');

      expect(analytics.length).toBeGreaterThan(0);
      analytics.forEach(a => {
        expect(a.session?.id).toBe('test-session');
      });
    });
  });

  describe('getMetricsSummary', () => {
    it('should return metrics summary', async () => {
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const summary = await repository.getMetricsSummary(timeRange);

      expect(summary).toEqual(expect.objectContaining({
        totalEvents: expect.any(Number),
        uniqueUsers: expect.any(Number),
        eventTypes: expect.any(Object),
        categories: expect.any(Object)
      }));
    });
  });

  describe('getAggregatedMetrics', () => {
    it('should return aggregated metrics', async () => {
      const options = {
        groupBy: 'hour' as const,
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date()
        },
        metric: 'value'
      };

      const metrics = await repository.getAggregatedMetrics(options);

      expect(Array.isArray(metrics)).toBe(true);
      metrics.forEach(m => {
        expect(m).toEqual(expect.objectContaining({
          timestamp: expect.any(Date),
          value: expect.any(Number)
        }));
      });
    });
  });
}); 