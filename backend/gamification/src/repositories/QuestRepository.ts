import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, IsNull, Between } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Quest, QuestType, QuestDifficulty } from '../models/Quest';
import { logger } from '../utils/logger';

export class QuestRepository extends BaseRepository<Quest> {
  constructor() {
    super(Quest);
  }

  async findAvailable(now: Date = new Date()): Promise<Quest[]> {
    try {
      return await this.find({
        where: [
          {
            isActive: true,
            startDate: IsNull(),
            endDate: IsNull()
          },
          {
            isActive: true,
            startDate: LessThanOrEqual(now),
            endDate: MoreThanOrEqual(now)
          }
        ] as FindOptionsWhere<Quest>[],
        order: { requiredLevel: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findAvailable:', error);
      throw error;
    }
  }

  async findByType(type: QuestType): Promise<Quest[]> {
    try {
      return await this.find({
        where: { type } as FindOptionsWhere<Quest>,
        order: { requiredLevel: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findByType:', error);
      throw error;
    }
  }

  async findByDifficulty(difficulty: QuestDifficulty): Promise<Quest[]> {
    try {
      return await this.find({
        where: { difficulty } as FindOptionsWhere<Quest>,
        order: { requiredLevel: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findByDifficulty:', error);
      throw error;
    }
  }

  async findByLevel(level: number): Promise<Quest[]> {
    try {
      return await this.find({
        where: { requiredLevel: LessThanOrEqual(level) } as FindOptionsWhere<Quest>,
        order: { requiredLevel: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findByLevel:', error);
      throw error;
    }
  }

  async findExpiring(days: number = 7): Promise<Quest[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await this.find({
        where: {
          endDate: Between(new Date(), futureDate),
          isActive: true
        } as FindOptionsWhere<Quest>,
        order: { endDate: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findExpiring:', error);
      throw error;
    }
  }

  async findByRewardPoints(minPoints: number): Promise<Quest[]> {
    try {
      return await this.find({
        where: { pointsReward: MoreThanOrEqual(minPoints) } as FindOptionsWhere<Quest>,
        order: { pointsReward: 'DESC' }
      });
    } catch (error) {
      logger.error('Error in findByRewardPoints:', error);
      throw error;
    }
  }

  async findByRewardExperience(minExp: number): Promise<Quest[]> {
    try {
      return await this.find({
        where: { experienceReward: MoreThanOrEqual(minExp) } as FindOptionsWhere<Quest>,
        order: { experienceReward: 'DESC' }
      });
    } catch (error) {
      logger.error('Error in findByRewardExperience:', error);
      throw error;
    }
  }

  async searchByName(query: string): Promise<Quest[]> {
    try {
      return await this.find({
        where: {
          name: { $ilike: `%${query}%` } as any
        } as FindOptionsWhere<Quest>
      });
    } catch (error) {
      logger.error('Error in searchByName:', error);
      throw error;
    }
  }

  async toggleActive(id: string): Promise<Quest | null> {
    try {
      const quest = await this.findById(id);
      if (!quest) return null;

      quest.isActive = !quest.isActive;
      return await this.repository.save(quest);
    } catch (error) {
      logger.error('Error in toggleActive:', error);
      throw error;
    }
  }

  async updateSchedule(
    id: string,
    startDate: Date | null,
    endDate: Date | null,
    timeLimit: string | null
  ): Promise<Quest | null> {
    try {
      return await this.update(id, { startDate, endDate, timeLimit });
    } catch (error) {
      logger.error('Error in updateSchedule:', error);
      throw error;
    }
  }

  async findDailyQuests(now: Date = new Date()): Promise<Quest[]> {
    try {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      return await this.find({
        where: {
          type: QuestType.DAILY,
          isActive: true,
          startDate: LessThanOrEqual(endOfDay),
          endDate: MoreThanOrEqual(startOfDay)
        } as FindOptionsWhere<Quest>
      });
    } catch (error) {
      logger.error('Error in findDailyQuests:', error);
      throw error;
    }
  }

  async findWeeklyQuests(now: Date = new Date()): Promise<Quest[]> {
    try {
      return await this.find({
        where: {
          type: QuestType.WEEKLY,
          isActive: true,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now)
        } as FindOptionsWhere<Quest>
      });
    } catch (error) {
      logger.error('Error in findWeeklyQuests:', error);
      throw error;
    }
  }
} 