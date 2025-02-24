import request from 'supertest';
import { Express } from 'express';
import { AppDataSource } from '../../config/database';
import { createApp } from '../../app';
import { User } from '../../models/User';
import { Achievement } from '../../models/Achievement';
import { Quest } from '../../models/Quest';
import { Reward } from '../../models/Reward';
import { generateJwtToken } from '../../utils/auth';
import { eventBus } from '../../config/eventBus';
import { logger } from '../../utils/logger';

describe('User API Endpoints', () => {
  let app: Express;
  let testUser: User;
  let adminUser: User;
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

    // Generate auth tokens
    authToken = generateJwtToken(testUser);
    adminToken = generateJwtToken(adminUser);
  });

  afterAll(async () => {
    // Close database connection
    await AppDataSource.destroy();
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        level: testUser.level,
        experience: testUser.experience,
        points: testUser.points
      }));
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('User not found');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user profile successfully', async () => {
      const updates = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining(updates));

      // Verify database update
      const updatedUser = await AppDataSource.getRepository(User).findOne({
        where: { id: testUser.id }
      });
      expect(updatedUser?.username).toBe(updates.username);
      expect(updatedUser?.email).toBe(updates.email);
    });

    it('should prevent unauthorized updates', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'hacker' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate update data', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/:id/progress', () => {
    beforeEach(async () => {
      // Create test achievements and progress
      const achievement = await AppDataSource.getRepository(Achievement).save({
        name: 'Test Achievement',
        description: 'Test Description',
        points: 100,
        criteria: { type: 'test' }
      });

      await AppDataSource.getRepository('AchievementProgress').save({
        userId: testUser.id,
        achievementId: achievement.id,
        progress: 50,
        status: 'IN_PROGRESS'
      });
    });

    it('should get user progress successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        achievements: expect.any(Number),
        quests: expect.any(Number),
        totalPoints: expect.any(Number)
      }));
    });
  });

  describe('POST /api/v1/users/:id/experience', () => {
    it('should add experience successfully', async () => {
      const amount = 100;
      const response = await request(app)
        .post(`/api/v1/users/${testUser.id}/experience`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.experience).toBe(testUser.experience + amount);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'user.experience.added',
        expect.objectContaining({
          userId: testUser.id,
          amount
        })
      );
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post(`/api/v1/users/${testUser.id}/experience`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 100 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/:id/points', () => {
    it('should add points successfully', async () => {
      const amount = 50;
      const response = await request(app)
        .post(`/api/v1/users/${testUser.id}/points`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.points).toBe(testUser.points + amount);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'user.points.added',
        expect.objectContaining({
          userId: testUser.id,
          amount
        })
      );
    });
  });

  describe('GET /api/v1/users/:id/achievements', () => {
    beforeEach(async () => {
      // Create test achievements and progress
      const achievements = await AppDataSource.getRepository(Achievement).save([
        {
          name: 'Achievement 1',
          description: 'Test Description',
          points: 100,
          criteria: { type: 'test' }
        },
        {
          name: 'Achievement 2',
          description: 'Test Description',
          points: 200,
          criteria: { type: 'test' }
        }
      ]);

      await AppDataSource.getRepository('AchievementProgress').save([
        {
          userId: testUser.id,
          achievementId: achievements[0].id,
          progress: 100,
          status: 'COMPLETED'
        },
        {
          userId: testUser.id,
          achievementId: achievements[1].id,
          progress: 50,
          status: 'IN_PROGRESS'
        }
      ]);
    });

    it('should get user achievements successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}/achievements`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toEqual(expect.objectContaining({
        name: 'Achievement 1',
        status: 'COMPLETED'
      }));
      expect(response.body.data[1]).toEqual(expect.objectContaining({
        name: 'Achievement 2',
        status: 'IN_PROGRESS'
      }));
    });
  });

  describe('GET /api/v1/users/search', () => {
    beforeEach(async () => {
      // Create additional test users
      await AppDataSource.getRepository(User).save([
        {
          username: 'searchuser1',
          email: 'search1@example.com',
          password: 'hashedPassword123',
          role: 'user'
        },
        {
          username: 'searchuser2',
          email: 'search2@example.com',
          password: 'hashedPassword123',
          role: 'user'
        }
      ]);
    });

    it('should search users successfully', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .query({ query: 'search', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(10);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .query({ query: 'search', page: 1, limit: 1 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/users/search')
        .query({ query: 'search' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
}); 