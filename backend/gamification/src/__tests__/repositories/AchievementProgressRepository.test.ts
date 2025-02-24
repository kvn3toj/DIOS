import { AchievementProgressRepository } from '../../repositories/AchievementProgressRepository';
import { AchievementProgress, ProgressStatus } from '../../models/AchievementProgress';
import { Achievement } from '../../models/Achievement';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';

describe('AchievementProgressRepository', () => {
  let repository: AchievementProgressRepository;
  let testUser: User;
  let testAchievement: Achievement;
  let testProgress: AchievementProgress;

  beforeEach(async () => {
    repository = new AchievementProgressRepository();
    testUser = await global.createTestUser();
    testAchievement = await global.createTestAchievement();
    testProgress = await repository.create({
      userId: testUser.id,
      achievementId: testAchievement.id,
      progress: 0,
      status: ProgressStatus.NOT_STARTED
    });
  });

  describe('create', () => {
    it('should create new progress record', async () => {
      const data = {
        userId: testUser.id,
        achievementId: testAchievement.id,
        progress: 50,
        status: ProgressStatus.IN_PROGRESS
      };

      const progress = await repository.create(data);

      expect(progress).toBeDefined();
      expect(progress.id).toBeDefined();
      expect(progress.userId).toBe(data.userId);
      expect(progress.achievementId).toBe(data.achievementId);
      expect(progress.progress).toBe(data.progress);
      expect(progress.status).toBe(data.status);
      expect(progress.createdAt).toBeDefined();
      expect(progress.updatedAt).toBeDefined();
    });

    it('should enforce unique user-achievement constraint', async () => {
      const data = {
        userId: testUser.id,
        achievementId: testAchievement.id,
        progress: 0,
        status: ProgressStatus.NOT_STARTED
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

  describe('findByUserAndAchievement', () => {
    it('should find progress by user and achievement', async () => {
      const progress = await repository.findByUserAndAchievement(
        testUser.id,
        testAchievement.id
      );

      expect(progress).toBeDefined();
      expect(progress?.userId).toBe(testUser.id);
      expect(progress?.achievementId).toBe(testAchievement.id);
    });

    it('should return null for non-existent combination', async () => {
      const progress = await repository.findByUserAndAchievement(
        'non-existent-user',
        'non-existent-achievement'
      );

      expect(progress).toBeNull();
    });
  });

  describe('findByUser', () => {
    beforeEach(async () => {
      // Create additional achievements and progress
      const achievement2 = await global.createTestAchievement({
        name: 'Achievement 2'
      });
      const achievement3 = await global.createTestAchievement({
        name: 'Achievement 3'
      });

      await repository.create({
        userId: testUser.id,
        achievementId: achievement2.id,
        progress: 100,
        status: ProgressStatus.COMPLETED
      });

      await repository.create({
        userId: testUser.id,
        achievementId: achievement3.id,
        progress: 50,
        status: ProgressStatus.IN_PROGRESS
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
        where: { status: ProgressStatus.COMPLETED }
      });

      expect(progress.length).toBeGreaterThan(0);
      progress.forEach(p => {
        expect(p.userId).toBe(testUser.id);
        expect(p.status).toBe(ProgressStatus.COMPLETED);
      });
    });

    it('should find progress records with relations', async () => {
      const progress = await repository.findByUser(testUser.id, {
        relations: ['achievement']
      });

      expect(progress.length).toBeGreaterThan(0);
      progress.forEach(p => {
        expect(p.achievement).toBeDefined();
        expect(p.achievement.id).toBe(p.achievementId);
      });
    });
  });

  describe('findCompletedByUser', () => {
    beforeEach(async () => {
      // Create completed progress
      const achievement2 = await global.createTestAchievement({
        name: 'Achievement 2'
      });

      await repository.create({
        userId: testUser.id,
        achievementId: achievement2.id,
        progress: 100,
        status: ProgressStatus.COMPLETED,
        completedAt: new Date()
      });
    });

    it('should find completed progress records', async () => {
      const completed = await repository.findCompletedByUser(testUser.id);

      expect(completed.length).toBeGreaterThan(0);
      completed.forEach(p => {
        expect(p.userId).toBe(testUser.id);
        expect(p.status).toBe(ProgressStatus.COMPLETED);
        expect(p.completedAt).toBeDefined();
      });
    });
  });

  describe('update', () => {
    it('should update progress record', async () => {
      const updates = {
        progress: 75,
        status: ProgressStatus.IN_PROGRESS
      };

      const progress = await repository.update(testProgress.id, updates);

      expect(progress).toBeDefined();
      expect(progress?.progress).toBe(updates.progress);
      expect(progress?.status).toBe(updates.status);
      expect(progress?.updatedAt).not.toBe(testProgress.updatedAt);
    });

    it('should handle completion update', async () => {
      const updates = {
        progress: 100,
        status: ProgressStatus.COMPLETED,
        completedAt: new Date()
      };

      const progress = await repository.update(testProgress.id, updates);

      expect(progress).toBeDefined();
      expect(progress?.status).toBe(ProgressStatus.COMPLETED);
      expect(progress?.completedAt).toBeDefined();
    });

    it('should return null for non-existent id', async () => {
      const progress = await repository.update('non-existent-id', { progress: 50 });

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