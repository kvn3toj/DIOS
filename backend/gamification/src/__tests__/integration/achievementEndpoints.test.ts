import request from 'supertest';
import { Express } from 'express';
import { AppDataSource } from '../../config/database';
import { createApp } from '../../app';
import { User } from '../../models/User';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { AchievementProgress, ProgressStatus } from '../../models/AchievementProgress';
import { generateJwtToken } from '../../utils/auth';
import { eventBus } from '../../config/eventBus';
import { logger } from '../../utils/logger';

describe('Achievement API Endpoints', () => {
  let app: Express;
  let testUser: User;
  let adminUser: User;
  let testAchievement: Achievement;
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

    // Create test achievement
    testAchievement = await AppDataSource.getRepository(Achievement).save({
      name: 'Test Achievement',
      description: 'Test Description',
      type: AchievementType.PROGRESSION,
      rarity: AchievementRarity.COMMON,
      points: 100,
      criteria: { type: 'score', target: 1000 },
      isActive: true
    });

    // Generate auth tokens
    authToken = generateJwtToken(testUser);
    adminToken = generateJwtToken(adminUser);
  });

  afterAll(async () => {
    // Close database connection
    await AppDataSource.destroy();
  });

  describe('POST /api/v1/achievements', () => {
    it('should create achievement successfully', async () => {
      const achievementData = {
        name: 'New Achievement',
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 }
      };

      const response = await request(app)
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(achievementData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        name: achievementData.name,
        description: achievementData.description,
        points: achievementData.points,
        isActive: true
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.created',
        expect.objectContaining({
          achievementId: response.body.data.id,
          type: achievementData.type
        })
      );
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/achievements/:id', () => {
    it('should get achievement successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/achievements/${testAchievement.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        id: testAchievement.id,
        name: testAchievement.name,
        description: testAchievement.description,
        points: testAchievement.points
      }));
    });

    it('should return 404 for non-existent achievement', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Achievement not found');
    });
  });

  describe('PUT /api/v1/achievements/:id', () => {
    it('should update achievement successfully', async () => {
      const updates = {
        name: 'Updated Achievement',
        description: 'Updated Description',
        points: 200
      };

      const response = await request(app)
        .put(`/api/v1/achievements/${testAchievement.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining(updates));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.updated',
        expect.objectContaining({
          achievementId: testAchievement.id,
          updates
        })
      );
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .put(`/api/v1/achievements/${testAchievement.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/achievements/user/:userId/available', () => {
    it('should get available achievements', async () => {
      const response = await request(app)
        .get(`/api/v1/achievements/user/${testUser.id}/available`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toEqual(expect.objectContaining({
        id: testAchievement.id,
        name: testAchievement.name
      }));
    });
  });

  describe('POST /api/v1/achievements/user/:userId/achievement/:achievementId/progress', () => {
    it('should update achievement progress successfully', async () => {
      const progressData = {
        progress: 50,
        metadata: { action: 'test' }
      };

      const response = await request(app)
        .post(`/api/v1/achievements/user/${testUser.id}/achievement/${testAchievement.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        userId: testUser.id,
        achievementId: testAchievement.id,
        progress: progressData.progress,
        status: ProgressStatus.IN_PROGRESS
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.progress.updated',
        expect.objectContaining({
          userId: testUser.id,
          achievementId: testAchievement.id,
          progress: progressData.progress
        })
      );
    });

    it('should handle achievement completion', async () => {
      const progressData = {
        progress: 100
      };

      const response = await request(app)
        .post(`/api/v1/achievements/user/${testUser.id}/achievement/${testAchievement.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(ProgressStatus.COMPLETED);

      // Verify completion event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.completed',
        expect.objectContaining({
          userId: testUser.id,
          achievementId: testAchievement.id
        })
      );

      // Verify user points were updated
      const updatedUser = await AppDataSource.getRepository(User).findOne({
        where: { id: testUser.id }
      });
      expect(updatedUser?.points).toBe(testUser.points + testAchievement.points);
    });
  });

  describe('GET /api/v1/achievements/stats', () => {
    it('should get achievement statistics', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        total: expect.any(Number),
        active: expect.any(Number),
        secret: expect.any(Number),
        expiringSoon: expect.any(Number)
      }));
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/achievements/search', () => {
    beforeEach(async () => {
      // Create additional test achievements
      await AppDataSource.getRepository(Achievement).save([
        {
          name: 'Search Achievement 1',
          description: 'Test Description',
          type: AchievementType.COLLECTION,
          rarity: AchievementRarity.RARE,
          points: 200,
          criteria: { type: 'collect', count: 10 },
          isActive: true
        },
        {
          name: 'Search Achievement 2',
          description: 'Test Description',
          type: AchievementType.EVENT,
          rarity: AchievementRarity.EPIC,
          points: 300,
          criteria: { type: 'event', id: 'test' },
          isActive: true
        }
      ]);
    });

    it('should search achievements successfully', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/search')
        .query({ query: 'Search', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/v1/achievements/search')
        .query({ query: 'Search', page: 1, limit: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
    });
  });
}); 