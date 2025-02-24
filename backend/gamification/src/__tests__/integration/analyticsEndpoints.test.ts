import request from 'supertest';
import { Express } from 'express';
import { AppDataSource } from '../../config/database';
import { createApp } from '../../app';
import { User } from '../../models/User';
import { Analytics, AnalyticsType, AnalyticsCategory } from '../../models/Analytics';
import { generateJwtToken } from '../../utils/auth';
import { eventBus } from '../../config/eventBus';
import { logger } from '../../utils/logger';

describe('Analytics API Endpoints', () => {
  let app: Express;
  let testUser: User;
  let adminUser: User;
  let testAnalytics: Analytics;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Initialize the application
    app = await createApp();

    // Initialize test database connection
    await AppDataSource.initialize();

    // Mock event bus
    jest.spyOn(eventBus, 'publish').mockImplementation(() => Promise.resolve());
  });

  beforeEach(async () => {
    // Clear database before each test
    await AppDataSource.synchronize(true);

    // Create test users
    testUser = await AppDataSource.getRepository(User).save({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'user',
      level: 1,
      experience: 0,
      points: 0
    });

    adminUser = await AppDataSource.getRepository(User).save({
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedPassword123',
      role: 'admin',
      level: 10,
      experience: 1000,
      points: 500
    });

    // Create test analytics event
    testAnalytics = await AppDataSource.getRepository(Analytics).save({
      userId: testUser.id,
      type: AnalyticsType.USER_ACTION,
      category: AnalyticsCategory.ENGAGEMENT,
      event: 'test_event',
      data: {
        value: 100,
        metadata: { action: 'test' }
      },
      metrics: {
        duration: 1000,
        count: 1,
        value: 100
      },
      timestamp: new Date(),
      source: 'test',
      platform: 'web',
      version: '1.0'
    });

    // Generate auth tokens
    authToken = generateJwtToken(testUser);
    adminToken = generateJwtToken(adminUser);
  });

  afterAll(async () => {
    // Close database connection
    await AppDataSource.destroy();
  });

  describe('POST /api/v1/analytics/events', () => {
    it('should track event successfully', async () => {
      const eventData = {
        userId: testUser.id,
        type: AnalyticsType.USER_ACTION,
        category: AnalyticsCategory.ENGAGEMENT,
        event: 'button_click',
        data: {
          value: 1,
          metadata: { buttonId: 'test-button' }
        },
        metrics: {
          duration: 100,
          count: 1
        },
        source: 'web-app',
        platform: 'web',
        version: '1.0'
      };

      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        userId: eventData.userId,
        type: eventData.type,
        category: eventData.category,
        event: eventData.event
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'analytics.event_tracked',
        expect.objectContaining({
          analyticsId: response.body.data.id,
          userId: eventData.userId,
          type: eventData.type,
          category: eventData.category
        })
      );
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          event: 'test'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/user/:userId', () => {
    beforeEach(async () => {
      // Create additional test events
      await AppDataSource.getRepository(Analytics).save([
        {
          userId: testUser.id,
          type: AnalyticsType.ACHIEVEMENT,
          category: AnalyticsCategory.PROGRESSION,
          event: 'achievement_unlocked',
          data: { value: 1 },
          timestamp: new Date()
        },
        {
          userId: testUser.id,
          type: AnalyticsType.QUEST,
          category: AnalyticsCategory.PROGRESSION,
          event: 'quest_completed',
          data: { value: 1 },
          timestamp: new Date()
        }
      ]);
    });

    it('should get user analytics successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/user/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should filter by time range', async () => {
      const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const end = new Date();

      const response = await request(app)
        .get(`/api/v1/analytics/user/${testUser.id}`)
        .query({
          start: start.toISOString(),
          end: end.toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(a => {
        const timestamp = new Date(a.timestamp);
        return timestamp >= start && timestamp <= end;
      })).toBe(true);
    });
  });

  describe('GET /api/v1/analytics/events/:event', () => {
    it('should get event analytics successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/events/${testAnalytics.event}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].event).toBe(testAnalytics.event);
    });
  });

  describe('GET /api/v1/analytics/metrics/summary', () => {
    it('should get metrics summary successfully', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics/summary')
        .query({
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          end: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        totalEvents: expect.any(Number),
        uniqueUsers: expect.any(Number),
        eventTypes: expect.any(Object),
        categories: expect.any(Object)
      }));
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/metrics/aggregated', () => {
    it('should get aggregated metrics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics/aggregated')
        .query({
          groupBy: 'hour',
          metric: 'value',
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          end: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toEqual(expect.objectContaining({
        timestamp: expect.any(String),
        value: expect.any(Number)
      }));
    });

    it('should validate groupBy parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics/aggregated')
        .query({
          groupBy: 'invalid',
          metric: 'value'
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/analytics/user/:userId/engagement', () => {
    it('should get user engagement metrics successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/user/${testUser.id}/engagement`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        totalEvents: expect.any(Number),
        eventsByType: expect.any(Object),
        averageSessionDuration: expect.any(Number),
        lastActive: expect.any(String)
      }));
    });
  });

  describe('GET /api/v1/analytics/metrics/system', () => {
    it('should get system metrics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics/system')
        .query({
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          end: new Date().toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        totalEvents: expect.any(Number),
        errorRate: expect.any(Number),
        averageResponseTime: expect.any(Number),
        activeUsers: expect.any(Number)
      }));
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/metrics/system')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 