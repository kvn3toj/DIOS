import { AchievementRepository } from '../../repositories/AchievementRepository';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { AppDataSource } from '../../config/database';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

describe('AchievementRepository', () => {
  let repository: AchievementRepository;
  let testAchievement: Achievement;

  beforeEach(async () => {
    repository = new AchievementRepository();
    testAchievement = await global.createTestAchievement();
  });

  describe('create', () => {
    it('should create a new achievement', async () => {
      const data = {
        name: 'New Achievement',
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 },
        isActive: true
      };

      const achievement = await repository.create(data);

      expect(achievement).toBeDefined();
      expect(achievement.id).toBeDefined();
      expect(achievement.name).toBe(data.name);
      expect(achievement.points).toBe(data.points);
      expect(achievement.isActive).toBe(true);
      expect(achievement.createdAt).toBeDefined();
      expect(achievement.updatedAt).toBeDefined();
    });

    it('should enforce unique name constraint', async () => {
      const data = {
        name: testAchievement.name,
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 },
        isActive: true
      };

      await expect(repository.create(data)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find achievement by id', async () => {
      const achievement = await repository.findById(testAchievement.id);

      expect(achievement).toBeDefined();
      expect(achievement?.id).toBe(testAchievement.id);
    });

    it('should return null for non-existent id', async () => {
      const achievement = await repository.findById('non-existent-id');

      expect(achievement).toBeNull();
    });
  });

  describe('update', () => {
    it('should update achievement', async () => {
      const updates = {
        name: 'Updated Achievement',
        points: 200,
        description: 'Updated Description'
      };

      const achievement = await repository.update(testAchievement.id, updates);

      expect(achievement).toBeDefined();
      expect(achievement?.name).toBe(updates.name);
      expect(achievement?.points).toBe(updates.points);
      expect(achievement?.description).toBe(updates.description);
      expect(achievement?.updatedAt).not.toBe(testAchievement.updatedAt);
    });

    it('should return null for non-existent id', async () => {
      const achievement = await repository.update('non-existent-id', { name: 'Updated' });

      expect(achievement).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete achievement', async () => {
      const result = await repository.delete(testAchievement.id);

      expect(result).toBe(true);

      const deleted = await repository.findById(testAchievement.id);
      expect(deleted).toBeNull();
    });

    it('should return false for non-existent id', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      // Create additional test achievements
      await repository.create({
        name: 'Achievement 1',
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 },
        isActive: true
      });

      await repository.create({
        name: 'Achievement 2',
        description: 'Test Description',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.RARE,
        points: 200,
        criteria: { type: 'items', count: 10 },
        isActive: false
      });
    });

    it('should find achievements with criteria', async () => {
      const achievements = await repository.find({
        where: {
          type: AchievementType.PROGRESSION,
          isActive: true
        }
      });

      expect(achievements.length).toBeGreaterThan(0);
      achievements.forEach(achievement => {
        expect(achievement.type).toBe(AchievementType.PROGRESSION);
        expect(achievement.isActive).toBe(true);
      });
    });

    it('should find achievements with ordering', async () => {
      const achievements = await repository.find({
        order: {
          points: 'DESC'
        }
      });

      expect(achievements.length).toBeGreaterThan(0);
      for (let i = 1; i < achievements.length; i++) {
        expect(achievements[i-1].points).toBeGreaterThanOrEqual(achievements[i].points);
      }
    });

    it('should find achievements with pagination', async () => {
      const limit = 2;
      const achievements = await repository.find({
        take: limit,
        skip: 1
      });

      expect(achievements.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('findExpiring', () => {
    beforeEach(async () => {
      // Create achievements with different expiry dates
      await repository.create({
        name: 'Expiring Soon',
        description: 'Test Description',
        type: AchievementType.EVENT,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'event', id: 'test' },
        isActive: true,
        availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });

      await repository.create({
        name: 'Expiring Later',
        description: 'Test Description',
        type: AchievementType.EVENT,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'event', id: 'test' },
        isActive: true,
        availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
    });

    it('should find achievements expiring within days', async () => {
      const days = 3;
      const expiring = await repository.findExpiring(days);

      expect(expiring.length).toBeGreaterThan(0);
      expiring.forEach(achievement => {
        expect(achievement.availableUntil).toBeDefined();
        const daysUntilExpiry = Math.ceil((achievement.availableUntil!.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        expect(daysUntilExpiry).toBeLessThanOrEqual(days);
      });
    });
  });

  describe('count', () => {
    it('should count achievements with criteria', async () => {
      const count = await repository.count({
        where: {
          isActive: true
        }
      });

      expect(count).toBeGreaterThan(0);
    });
  });
}); 