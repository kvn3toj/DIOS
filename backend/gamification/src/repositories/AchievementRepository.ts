import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Achievement, AchievementType, AchievementRarity } from '../models/Achievement';
import { logger } from '../utils/logger';

export class AchievementRepository extends BaseRepository<Achievement> {
  constructor() {
    super(Achievement);
  }

  async findAvailable(now: Date = new Date()): Promise<Achievement[]> {
    try {
      return await this.find({
        where: [
          {
            isActive: true,
            availableUntil: IsNull()
          },
          {
            isActive: true,
            availableUntil: MoreThanOrEqual(now)
          }
        ] as FindOptionsWhere<Achievement>[]
      });
    } catch (error) {
      logger.error('Error in findAvailable:', error);
      throw error;
    }
  }

  async findByType(type: AchievementType): Promise<Achievement[]> {
    try {
      return await this.find({
        where: { type } as FindOptionsWhere<Achievement>
      });
    } catch (error) {
      logger.error('Error in findByType:', error);
      throw error;
    }
  }

  async findByRarity(rarity: AchievementRarity): Promise<Achievement[]> {
    try {
      return await this.find({
        where: { rarity } as FindOptionsWhere<Achievement>
      });
    } catch (error) {
      logger.error('Error in findByRarity:', error);
      throw error;
    }
  }

  async findByLevel(level: number): Promise<Achievement[]> {
    try {
      return await this.find({
        where: { requiredLevel: LessThanOrEqual(level) } as FindOptionsWhere<Achievement>,
        order: { requiredLevel: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findByLevel:', error);
      throw error;
    }
  }

  async findSecret(): Promise<Achievement[]> {
    try {
      return await this.find({
        where: { isSecret: true } as FindOptionsWhere<Achievement>
      });
    } catch (error) {
      logger.error('Error in findSecret:', error);
      throw error;
    }
  }

  async findExpiring(days: number = 7): Promise<Achievement[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await this.find({
        where: {
          availableUntil: LessThanOrEqual(futureDate),
          isActive: true
        } as FindOptionsWhere<Achievement>,
        order: { availableUntil: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findExpiring:', error);
      throw error;
    }
  }

  async findByPoints(minPoints: number): Promise<Achievement[]> {
    try {
      return await this.find({
        where: { points: MoreThanOrEqual(minPoints) } as FindOptionsWhere<Achievement>,
        order: { points: 'DESC' }
      });
    } catch (error) {
      logger.error('Error in findByPoints:', error);
      throw error;
    }
  }

  async searchByName(query: string): Promise<Achievement[]> {
    try {
      return await this.find({
        where: {
          name: { $ilike: `%${query}%` } as any
        } as FindOptionsWhere<Achievement>
      });
    } catch (error) {
      logger.error('Error in searchByName:', error);
      throw error;
    }
  }

  async toggleActive(id: string): Promise<Achievement | null> {
    try {
      const achievement = await this.findById(id);
      if (!achievement) return null;

      achievement.isActive = !achievement.isActive;
      return await this.repository.save(achievement);
    } catch (error) {
      logger.error('Error in toggleActive:', error);
      throw error;
    }
  }

  async toggleSecret(id: string): Promise<Achievement | null> {
    try {
      const achievement = await this.findById(id);
      if (!achievement) return null;

      achievement.isSecret = !achievement.isSecret;
      return await this.repository.save(achievement);
    } catch (error) {
      logger.error('Error in toggleSecret:', error);
      throw error;
    }
  }

  async updateAvailability(id: string, availableUntil: Date | null): Promise<Achievement | null> {
    try {
      return await this.update(id, { availableUntil });
    } catch (error) {
      logger.error('Error in updateAvailability:', error);
      throw error;
    }
  }
} 