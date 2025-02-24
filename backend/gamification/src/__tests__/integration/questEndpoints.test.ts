import request from 'supertest';
import { Express } from 'express';
import { AppDataSource } from '../../config/database';
import { createApp } from '../../app';
import { User } from '../../models/User';
import { Quest, QuestType, QuestDifficulty } from '../../models/Quest';
import { QuestProgress, QuestProgressStatus } from '../../models/QuestProgress';
import { generateJwtToken } from '../../utils/auth';
import { eventBus } from '../../config/eventBus';
import { logger } from '../../utils/logger';

describe('Quest API Endpoints', () => {
  let app: Express;
  let testUser: User;
  let adminUser: User;
  let testQuest: Quest;
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

    // Create test quest
    testQuest = await AppDataSource.getRepository(Quest).save({
      name: 'Test Quest',
      description: 'Test Description',
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.EASY,
      experienceReward: 100,
      pointsReward: 50,
      objectives: [
        { type: 'score', target: 1000, description: 'Score 1000 points', order: 1 },
        { type: 'collect', target: 5, description: 'Collect 5 items', order: 2 }
      ],
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

  describe('POST /api/v1/quests', () => {
    it('should create quest successfully', async () => {
      const questData = {
        name: 'New Quest',
        description: 'Test Description',
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.EASY,
        experienceReward: 100,
        pointsReward: 50,
        objectives: [
          { type: 'score', target: 1000, description: 'Score 1000 points', order: 1 }
        ]
      };

      const response = await request(app)
        .post('/api/v1/quests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(questData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        name: questData.name,
        description: questData.description,
        experienceReward: questData.experienceReward,
        pointsReward: questData.pointsReward,
        isActive: true
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'quest.created',
        expect.objectContaining({
          questId: response.body.data.id,
          type: questData.type
        })
      );
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/quests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/quests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/quests/:id', () => {
    it('should get quest successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/quests/${testQuest.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        id: testQuest.id,
        name: testQuest.name,
        description: testQuest.description,
        experienceReward: testQuest.experienceReward,
        pointsReward: testQuest.pointsReward
      }));
    });

    it('should return 404 for non-existent quest', async () => {
      const response = await request(app)
        .get('/api/v1/quests/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Quest not found');
    });
  });

  describe('PUT /api/v1/quests/:id', () => {
    it('should update quest successfully', async () => {
      const updates = {
        name: 'Updated Quest',
        description: 'Updated Description',
        experienceReward: 200,
        pointsReward: 100
      };

      const response = await request(app)
        .put(`/api/v1/quests/${testQuest.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining(updates));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'quest.updated',
        expect.objectContaining({
          questId: testQuest.id,
          updates
        })
      );
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .put(`/api/v1/quests/${testQuest.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/quests/user/:userId/available', () => {
    it('should get available quests', async () => {
      const response = await request(app)
        .get(`/api/v1/quests/user/${testUser.id}/available`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toEqual(expect.objectContaining({
        id: testQuest.id,
        name: testQuest.name
      }));
    });
  });

  describe('POST /api/v1/quests/user/:userId/quest/:questId/start', () => {
    it('should start quest successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        userId: testUser.id,
        questId: testQuest.id,
        status: QuestProgressStatus.IN_PROGRESS
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'quest.started',
        expect.objectContaining({
          userId: testUser.id,
          questId: testQuest.id
        })
      );
    });

    it('should prevent starting already started quest', async () => {
      // Start quest first time
      await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      // Try to start again
      const response = await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/start`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/quests/user/:userId/quest/:questId/progress', () => {
    beforeEach(async () => {
      // Start the quest
      await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/start`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should update quest progress successfully', async () => {
      const progressData = {
        objectiveIndex: 0,
        value: 500
      };

      const response = await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.objectiveProgress[0]).toEqual(expect.objectContaining({
        index: progressData.objectiveIndex,
        progress: progressData.value,
        completed: false
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'quest.progress.updated',
        expect.objectContaining({
          userId: testUser.id,
          questId: testQuest.id,
          objectiveIndex: progressData.objectiveIndex,
          value: progressData.value
        })
      );
    });

    it('should handle quest completion', async () => {
      // Complete first objective
      await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ objectiveIndex: 0, value: 1000 });

      // Complete second objective
      const response = await request(app)
        .post(`/api/v1/quests/user/${testUser.id}/quest/${testQuest.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ objectiveIndex: 1, value: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(QuestProgressStatus.COMPLETED);

      // Verify completion event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'quest.completed',
        expect.objectContaining({
          userId: testUser.id,
          questId: testQuest.id
        })
      );

      // Verify user rewards were given
      const updatedUser = await AppDataSource.getRepository(User).findOne({
        where: { id: testUser.id }
      });
      expect(updatedUser?.experience).toBe(testUser.experience + testQuest.experienceReward);
      expect(updatedUser?.points).toBe(testUser.points + testQuest.pointsReward);
    });
  });

  describe('GET /api/v1/quests/stats', () => {
    it('should get quest statistics', async () => {
      const response = await request(app)
        .get('/api/v1/quests/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        total: expect.any(Number),
        active: expect.any(Number),
        daily: expect.any(Number),
        weekly: expect.any(Number),
        expiringSoon: expect.any(Number)
      }));
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .get('/api/v1/quests/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/quests/search', () => {
    beforeEach(async () => {
      // Create additional test quests
      await AppDataSource.getRepository(Quest).save([
        {
          name: 'Search Quest 1',
          description: 'Test Description',
          type: QuestType.WEEKLY,
          difficulty: QuestDifficulty.MEDIUM,
          experienceReward: 200,
          pointsReward: 100,
          objectives: [{ type: 'collect', target: 10, description: 'Collect items', order: 1 }],
          isActive: true
        },
        {
          name: 'Search Quest 2',
          description: 'Test Description',
          type: QuestType.EVENT,
          difficulty: QuestDifficulty.HARD,
          experienceReward: 300,
          pointsReward: 150,
          objectives: [{ type: 'event', target: 1, description: 'Complete event', order: 1 }],
          isActive: true
        }
      ]);
    });

    it('should search quests successfully', async () => {
      const response = await request(app)
        .get('/api/v1/quests/search')
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
        .get('/api/v1/quests/search')
        .query({ query: 'Search', page: 1, limit: 1 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
    });
  });
}); 