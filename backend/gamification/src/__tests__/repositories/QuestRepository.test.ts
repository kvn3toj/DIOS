import { QuestRepository } from '../../repositories/QuestRepository';
import { Quest, QuestType, QuestDifficulty } from '../../models/Quest';
import { AppDataSource } from '../../config/database';

describe('QuestRepository', () => {
  let repository: QuestRepository;
  let testQuest: Quest;

  beforeEach(async () => {
    repository = new QuestRepository();
    testQuest = await global.createTestQuest();
  });

  describe('create', () => {
    it('should create a new quest', async () => {
      const data = {
        name: 'New Quest',
        description: 'Test Description',
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.EASY,
        experienceReward: 100,
        pointsReward: 50,
        objectives: [
          { type: 'score', target: 1000, order: 1 },
          { type: 'collect', target: 5, order: 2 }
        ],
        isActive: true
      };

      const quest = await repository.create(data);

      expect(quest).toBeDefined();
      expect(quest.id).toBeDefined();
      expect(quest.name).toBe(data.name);
      expect(quest.experienceReward).toBe(data.experienceReward);
      expect(quest.pointsReward).toBe(data.pointsReward);
      expect(quest.objectives).toHaveLength(2);
      expect(quest.isActive).toBe(true);
      expect(quest.createdAt).toBeDefined();
      expect(quest.updatedAt).toBeDefined();
    });

    it('should enforce unique name constraint', async () => {
      const data = {
        name: testQuest.name,
        description: 'Test Description',
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.EASY,
        experienceReward: 100,
        pointsReward: 50,
        objectives: [],
        isActive: true
      };

      await expect(repository.create(data)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find quest by id', async () => {
      const quest = await repository.findById(testQuest.id);

      expect(quest).toBeDefined();
      expect(quest?.id).toBe(testQuest.id);
    });

    it('should return null for non-existent id', async () => {
      const quest = await repository.findById('non-existent-id');

      expect(quest).toBeNull();
    });
  });

  describe('update', () => {
    it('should update quest', async () => {
      const updates = {
        name: 'Updated Quest',
        experienceReward: 200,
        pointsReward: 100,
        description: 'Updated Description'
      };

      const quest = await repository.update(testQuest.id, updates);

      expect(quest).toBeDefined();
      expect(quest?.name).toBe(updates.name);
      expect(quest?.experienceReward).toBe(updates.experienceReward);
      expect(quest?.pointsReward).toBe(updates.pointsReward);
      expect(quest?.description).toBe(updates.description);
      expect(quest?.updatedAt).not.toBe(testQuest.updatedAt);
    });

    it('should update quest objectives', async () => {
      const updates = {
        objectives: [
          { type: 'score', target: 2000, order: 1 },
          { type: 'time', duration: 3600, order: 2 }
        ]
      };

      const quest = await repository.update(testQuest.id, updates);

      expect(quest).toBeDefined();
      expect(quest?.objectives).toHaveLength(2);
      expect(quest?.objectives[0].target).toBe(2000);
      expect(quest?.objectives[1].duration).toBe(3600);
    });

    it('should return null for non-existent id', async () => {
      const quest = await repository.update('non-existent-id', { name: 'Updated' });

      expect(quest).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete quest', async () => {
      const result = await repository.delete(testQuest.id);

      expect(result).toBe(true);

      const deleted = await repository.findById(testQuest.id);
      expect(deleted).toBeNull();
    });

    it('should return false for non-existent id', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      // Create additional test quests
      await repository.create({
        name: 'Daily Quest',
        description: 'Test Description',
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.EASY,
        experienceReward: 100,
        pointsReward: 50,
        objectives: [{ type: 'score', target: 1000, order: 1 }],
        isActive: true
      });

      await repository.create({
        name: 'Weekly Quest',
        description: 'Test Description',
        type: QuestType.WEEKLY,
        difficulty: QuestDifficulty.HARD,
        experienceReward: 500,
        pointsReward: 200,
        objectives: [{ type: 'collect', target: 10, order: 1 }],
        isActive: false
      });
    });

    it('should find quests with criteria', async () => {
      const quests = await repository.find({
        where: {
          type: QuestType.DAILY,
          isActive: true
        }
      });

      expect(quests.length).toBeGreaterThan(0);
      quests.forEach(quest => {
        expect(quest.type).toBe(QuestType.DAILY);
        expect(quest.isActive).toBe(true);
      });
    });

    it('should find quests with ordering', async () => {
      const quests = await repository.find({
        order: {
          experienceReward: 'DESC'
        }
      });

      expect(quests.length).toBeGreaterThan(0);
      for (let i = 1; i < quests.length; i++) {
        expect(quests[i-1].experienceReward).toBeGreaterThanOrEqual(quests[i].experienceReward);
      }
    });

    it('should find quests with pagination', async () => {
      const limit = 2;
      const quests = await repository.find({
        take: limit,
        skip: 1
      });

      expect(quests.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('findAvailable', () => {
    beforeEach(async () => {
      // Create quests with different availability
      await repository.create({
        name: 'Available Quest',
        description: 'Test Description',
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.EASY,
        experienceReward: 100,
        pointsReward: 50,
        objectives: [{ type: 'score', target: 1000, order: 1 }],
        isActive: true,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });

      await repository.create({
        name: 'Future Quest',
        description: 'Test Description',
        type: QuestType.WEEKLY,
        difficulty: QuestDifficulty.MEDIUM,
        experienceReward: 200,
        pointsReward: 100,
        objectives: [{ type: 'collect', target: 5, order: 1 }],
        isActive: true,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });
    });

    it('should find available quests', async () => {
      const quests = await repository.findAvailable();

      expect(quests.length).toBeGreaterThan(0);
      quests.forEach(quest => {
        expect(quest.isActive).toBe(true);
        if (quest.startDate) {
          expect(quest.startDate.getTime()).toBeLessThanOrEqual(Date.now());
        }
        if (quest.endDate) {
          expect(quest.endDate.getTime()).toBeGreaterThan(Date.now());
        }
      });
    });
  });

  describe('findDailyQuests', () => {
    it('should find active daily quests', async () => {
      const quests = await repository.findDailyQuests();

      expect(Array.isArray(quests)).toBe(true);
      quests.forEach(quest => {
        expect(quest.type).toBe(QuestType.DAILY);
        expect(quest.isActive).toBe(true);
      });
    });
  });

  describe('findWeeklyQuests', () => {
    it('should find active weekly quests', async () => {
      const quests = await repository.findWeeklyQuests();

      expect(Array.isArray(quests)).toBe(true);
      quests.forEach(quest => {
        expect(quest.type).toBe(QuestType.WEEKLY);
        expect(quest.isActive).toBe(true);
      });
    });
  });

  describe('findExpiring', () => {
    it('should find quests expiring within days', async () => {
      const days = 3;
      const expiring = await repository.findExpiring(days);

      expect(Array.isArray(expiring)).toBe(true);
      expiring.forEach(quest => {
        expect(quest.endDate).toBeDefined();
        const daysUntilExpiry = Math.ceil((quest.endDate!.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        expect(daysUntilExpiry).toBeLessThanOrEqual(days);
      });
    });
  });

  describe('count', () => {
    it('should count quests with criteria', async () => {
      const count = await repository.count({
        where: {
          isActive: true
        }
      });

      expect(count).toBeGreaterThan(0);
    });
  });
}); 