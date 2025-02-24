import { QuestProgressRepository } from '../../repositories/QuestProgressRepository';
import { QuestProgress, QuestProgressStatus } from '../../models/QuestProgress';
import { Quest } from '../../models/Quest';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';

describe('QuestProgressRepository', () => {
  let repository: QuestProgressRepository;
  let testUser: User;
  let testQuest: Quest;
  let testProgress: QuestProgress;

  beforeEach(async () => {
    repository = new QuestProgressRepository();
    testUser = await global.createTestUser();
    testQuest = await global.createTestQuest();
    testProgress = await repository.create({
      userId: testUser.id,
      questId: testQuest.id,
      status: QuestProgressStatus.NOT_STARTED,
      objectiveProgress: []
    });
  });

  describe('create', () => {
    it('should create new progress record', async () => {
      const data = {
        userId: testUser.id,
        questId: testQuest.id,
        status: QuestProgressStatus.IN_PROGRESS,
        objectiveProgress: [
          { index: 0, progress: 50, completed: false },
          { index: 1, progress: 0, completed: false }
        ]
      };

      const progress = await repository.create(data);

      expect(progress).toBeDefined();
      expect(progress.id).toBeDefined();
      expect(progress.userId).toBe(data.userId);
      expect(progress.questId).toBe(data.questId);
      expect(progress.status).toBe(data.status);
      expect(progress.objectiveProgress).toHaveLength(2);
      expect(progress.createdAt).toBeDefined();
      expect(progress.updatedAt).toBeDefined();
    });

    it('should enforce unique user-quest constraint', async () => {
      const data = {
        userId: testUser.id,
        questId: testQuest.id,
        status: QuestProgressStatus.NOT_STARTED,
        objectiveProgress: []
      };

      await expect(repository.create(data)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find progress by id', async () => {
      const progress = await repository.findById(testProgress.id);

      expect(progress).toBeDefined();
      expect(progress?.id).toBe(testProgress.id);
    });

    it('should return null for non-existent id', async () => {
      const progress = await repository.findById('non-existent-id');

      expect(progress).toBeNull();
    });
  });

  describe('findByUserAndQuest', () => {
    it('should find progress by user and quest', async () => {
      const progress = await repository.findByUserAndQuest(
        testUser.id,
        testQuest.id
      );

      expect(progress).toBeDefined();
      expect(progress?.userId).toBe(testUser.id);
      expect(progress?.questId).toBe(testQuest.id);
    });

    it('should return null for non-existent combination', async () => {
      const progress = await repository.findByUserAndQuest(
        'non-existent-user',
        'non-existent-quest'
      );

      expect(progress).toBeNull();
    });
  });

  describe('findByUser', () => {
    beforeEach(async () => {
      // Create additional quests and progress
      const quest2 = await global.createTestQuest({
        name: 'Quest 2'
      });
      const quest3 = await global.createTestQuest({
        name: 'Quest 3'
      });

      await repository.create({
        userId: testUser.id,
        questId: quest2.id,
        status: QuestProgressStatus.COMPLETED,
        objectiveProgress: [
          { index: 0, progress: 100, completed: true }
        ],
        completedAt: new Date()
      });

      await repository.create({
        userId: testUser.id,
        questId: quest3.id,
        status: QuestProgressStatus.IN_PROGRESS,
        objectiveProgress: [
          { index: 0, progress: 50, completed: false }
        ]
      });
    });

    it('should find all progress records for user', async () => {
      const progress = await repository.findByUser(testUser.id);

      expect(progress.length).toBe(3);
      progress.forEach(p => {
        expect(p.userId).toBe(testUser.id);
      });
    });

    it('should find completed progress records for user', async () => {
      const progress = await repository.findByUser(testUser.id, {
        where: { status: QuestProgressStatus.COMPLETED }
      });

      expect(progress.length).toBeGreaterThan(0);
      progress.forEach(p => {
        expect(p.userId).toBe(testUser.id);
        expect(p.status).toBe(QuestProgressStatus.COMPLETED);
      });
    });

    it('should find progress records with relations', async () => {
      const progress = await repository.findByUser(testUser.id, {
        relations: ['quest']
      });

      expect(progress.length).toBeGreaterThan(0);
      progress.forEach(p => {
        expect(p.quest).toBeDefined();
        expect(p.quest.id).toBe(p.questId);
      });
    });
  });

  describe('findActiveByUser', () => {
    beforeEach(async () => {
      // Create active quest progress
      const quest2 = await global.createTestQuest({
        name: 'Active Quest'
      });

      await repository.create({
        userId: testUser.id,
        questId: quest2.id,
        status: QuestProgressStatus.IN_PROGRESS,
        objectiveProgress: [
          { index: 0, progress: 50, completed: false }
        ],
        startedAt: new Date()
      });
    });

    it('should find active progress records', async () => {
      const active = await repository.findActiveByUser(testUser.id);

      expect(active.length).toBeGreaterThan(0);
      active.forEach(p => {
        expect(p.userId).toBe(testUser.id);
        expect(p.status).toBe(QuestProgressStatus.IN_PROGRESS);
        expect(p.startedAt).toBeDefined();
      });
    });
  });

  describe('update', () => {
    it('should update progress record', async () => {
      const updates = {
        status: QuestProgressStatus.IN_PROGRESS,
        objectiveProgress: [
          { index: 0, progress: 75, completed: false }
        ]
      };

      const progress = await repository.update(testProgress.id, updates);

      expect(progress).toBeDefined();
      expect(progress?.status).toBe(updates.status);
      expect(progress?.objectiveProgress).toHaveLength(1);
      expect(progress?.objectiveProgress[0].progress).toBe(75);
      expect(progress?.updatedAt).not.toBe(testProgress.updatedAt);
    });

    it('should handle completion update', async () => {
      const updates = {
        status: QuestProgressStatus.COMPLETED,
        objectiveProgress: [
          { index: 0, progress: 100, completed: true }
        ],
        completedAt: new Date()
      };

      const progress = await repository.update(testProgress.id, updates);

      expect(progress).toBeDefined();
      expect(progress?.status).toBe(QuestProgressStatus.COMPLETED);
      expect(progress?.completedAt).toBeDefined();
      expect(progress?.objectiveProgress[0].completed).toBe(true);
    });

    it('should return null for non-existent id', async () => {
      const progress = await repository.update('non-existent-id', {
        status: QuestProgressStatus.IN_PROGRESS
      });

      expect(progress).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete progress record', async () => {
      const result = await repository.delete(testProgress.id);

      expect(result).toBe(true);

      const deleted = await repository.findById(testProgress.id);
      expect(deleted).toBeNull();
    });

    it('should return false for non-existent id', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count progress records with criteria', async () => {
      const count = await repository.count({
        where: {
          userId: testUser.id
        }
      });

      expect(count).toBeGreaterThan(0);
    });
  });
}); 