import { AchievementService } from '../../services/AchievementService';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { ProgressStatus } from '../../models/AchievementProgress';
import { AppDataSource } from '../../config/database';
import { eventBus } from '../../config/eventBus';

describe('AchievementService', () => {
  let service: AchievementService;
  let testUser: any;
  let testAchievement: Achievement;

  beforeEach(async () => {
    service = new AchievementService();
    testUser = await global.createTestUser();
    testAchievement = await global.createTestAchievement();
  });

  describe('createAchievement', () => {
    it('should create a new achievement', async () => {
      const data = {
        name: 'Test Achievement',
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 }
      };

      const achievement = await service.createAchievement(data);

      expect(achievement).toBeDefined();
      expect(achievement.name).toBe(data.name);
      expect(achievement.points).toBe(data.points);
      expect(achievement.isActive).toBe(true);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.created',
        expect.objectContaining({
          achievementId: achievement.id,
          type: achievement.type
        })
      );
    });

    it('should throw error if name is not unique', async () => {
      const data = {
        name: testAchievement.name,
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 }
      };

      await expect(service.createAchievement(data)).rejects.toThrow();
    });
  });

  describe('getAchievement', () => {
    it('should return achievement by id', async () => {
      const achievement = await service.getAchievement(testAchievement.id);

      expect(achievement).toBeDefined();
      expect(achievement.id).toBe(testAchievement.id);
    });

    it('should throw error if achievement not found', async () => {
      await expect(service.getAchievement('non-existent-id')).rejects.toThrow('Achievement not found');
    });
  });

  describe('updateAchievement', () => {
    it('should update achievement', async () => {
      const updates = {
        name: 'Updated Achievement',
        points: 200
      };

      const achievement = await service.updateAchievement(testAchievement.id, updates);

      expect(achievement.name).toBe(updates.name);
      expect(achievement.points).toBe(updates.points);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.updated',
        expect.objectContaining({
          achievementId: achievement.id,
          updates
        })
      );
    });

    it('should throw error if achievement not found', async () => {
      await expect(service.updateAchievement('non-existent-id', { name: 'Updated' })).rejects.toThrow('Achievement not found');
    });
  });

  describe('getAvailableAchievements', () => {
    it('should return available achievements for user', async () => {
      const achievements = await service.getAvailableAchievements(testUser.id);

      expect(Array.isArray(achievements)).toBe(true);
      achievements.forEach(achievement => {
        expect(achievement.isActive).toBe(true);
        expect(achievement.requiredLevel || 0).toBeLessThanOrEqual(testUser.level);
      });
    });

    it('should throw error if user not found', async () => {
      await expect(service.getAvailableAchievements('non-existent-id')).rejects.toThrow('User not found');
    });
  });

  describe('updateProgress', () => {
    it('should create new progress if none exists', async () => {
      const progress = await service.updateProgress(testUser.id, testAchievement.id, 50);

      expect(progress).toBeDefined();
      expect(progress.userId).toBe(testUser.id);
      expect(progress.achievementId).toBe(testAchievement.id);
      expect(progress.progress).toBe(50);
      expect(progress.status).toBe(ProgressStatus.IN_PROGRESS);
    });

    it('should update existing progress', async () => {
      // Create initial progress
      await service.updateProgress(testUser.id, testAchievement.id, 50);

      // Update progress
      const progress = await service.updateProgress(testUser.id, testAchievement.id, 100);

      expect(progress.progress).toBe(100);
      expect(progress.status).toBe(ProgressStatus.COMPLETED);

      // Verify completion event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'achievement.completed',
        expect.objectContaining({
          userId: testUser.id,
          achievementId: testAchievement.id
        })
      );
    });

    it('should handle achievement completion', async () => {
      const progress = await service.updateProgress(testUser.id, testAchievement.id, 100);

      expect(progress.status).toBe(ProgressStatus.COMPLETED);
      expect(progress.completedAt).toBeDefined();

      // Verify user points were updated
      const user = await AppDataSource.getRepository('User').findOne({ where: { id: testUser.id } });
      expect(user.points).toBe(testUser.points + testAchievement.points);
    });
  });

  describe('getAchievementStats', () => {
    it('should return achievement statistics', async () => {
      const stats = await service.getAchievementStats();

      expect(stats).toEqual(expect.objectContaining({
        total: expect.any(Number),
        active: expect.any(Number),
        secret: expect.any(Number),
        expiringSoon: expect.any(Number)
      }));
    });
  });
}); 