import { FindOptionsWhere, Between } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { AchievementProgress, ProgressStatus } from '../models/AchievementProgress';
import { logger } from '../utils/logger';

export class AchievementProgressRepository extends BaseRepository<AchievementProgress> {
  constructor() {
    super(AchievementProgress);
  }

  async findByUser(userId: string, relations: string[] = []): Promise<AchievementProgress[]> {
    try {
      return await this.find({
        where: { userId } as FindOptionsWhere<AchievementProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByUser:', error);
      throw error;
    }
  }

  async findByAchievement(achievementId: string, relations: string[] = []): Promise<AchievementProgress[]> {
    try {
      return await this.find({
        where: { achievementId } as FindOptionsWhere<AchievementProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByAchievement:', error);
      throw error;
    }
  }

  async findByUserAndAchievement(userId: string, achievementId: string, relations: string[] = []): Promise<AchievementProgress | null> {
    try {
      return await this.findOne({
        where: { userId, achievementId } as FindOptionsWhere<AchievementProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByUserAndAchievement:', error);
      throw error;
    }
  }

  async findByStatus(status: ProgressStatus, relations: string[] = []): Promise<AchievementProgress[]> {
    try {
      return await this.find({
        where: { status } as FindOptionsWhere<AchievementProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByStatus:', error);
      throw error;
    }
  }

  async findCompletedByUser(userId: string, relations: string[] = []): Promise<AchievementProgress[]> {
    try {
      return await this.find({
        where: {
          userId,
          status: ProgressStatus.COMPLETED
        } as FindOptionsWhere<AchievementProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findCompletedByUser:', error);
      throw error;
    }
  }

  async findInProgressByUser(userId: string, relations: string[] = []): Promise<AchievementProgress[]> {
    try {
      return await this.find({
        where: {
          userId,
          status: ProgressStatus.IN_PROGRESS
        } as FindOptionsWhere<AchievementProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findInProgressByUser:', error);
      throw error;
    }
  }

  async findRecentlyCompleted(days: number = 7, relations: string[] = []): Promise<AchievementProgress[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await this.find({
        where: {
          status: ProgressStatus.COMPLETED,
          completedAt: Between(startDate, new Date())
        } as FindOptionsWhere<AchievementProgress>,
        relations,
        order: { completedAt: 'DESC' }
      });
    } catch (error) {
      logger.error('Error in findRecentlyCompleted:', error);
      throw error;
    }
  }

  async updateProgress(id: string, progress: number): Promise<AchievementProgress | null> {
    try {
      const achievementProgress = await this.findById(id);
      if (!achievementProgress) return null;

      achievementProgress.updateProgress(progress);
      return await this.repository.save(achievementProgress);
    } catch (error) {
      logger.error('Error in updateProgress:', error);
      throw error;
    }
  }

  async markAsCompleted(id: string): Promise<AchievementProgress | null> {
    try {
      const achievementProgress = await this.findById(id);
      if (!achievementProgress) return null;

      achievementProgress.markAsCompleted();
      return await this.repository.save(achievementProgress);
    } catch (error) {
      logger.error('Error in markAsCompleted:', error);
      throw error;
    }
  }

  async markAsFailed(id: string): Promise<AchievementProgress | null> {
    try {
      const achievementProgress = await this.findById(id);
      if (!achievementProgress) return null;

      achievementProgress.markAsFailed();
      return await this.repository.save(achievementProgress);
    } catch (error) {
      logger.error('Error in markAsFailed:', error);
      throw error;
    }
  }

  async collectRewards(id: string): Promise<AchievementProgress | null> {
    try {
      const achievementProgress = await this.findById(id);
      if (!achievementProgress) return null;

      achievementProgress.collectRewards();
      return await this.repository.save(achievementProgress);
    } catch (error) {
      logger.error('Error in collectRewards:', error);
      throw error;
    }
  }

  async resetProgress(id: string): Promise<AchievementProgress | null> {
    try {
      const achievementProgress = await this.findById(id);
      if (!achievementProgress) return null;

      achievementProgress.reset();
      return await this.repository.save(achievementProgress);
    } catch (error) {
      logger.error('Error in resetProgress:', error);
      throw error;
    }
  }
} 