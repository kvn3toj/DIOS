import { FindOptionsWhere, Between } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { QuestProgress, QuestProgressStatus } from '../models/QuestProgress';
import { logger } from '../utils/logger';

export class QuestProgressRepository extends BaseRepository<QuestProgress> {
  constructor() {
    super(QuestProgress);
  }

  async findByUser(userId: string, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      return await this.find({
        where: { userId } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByUser:', error);
      throw error;
    }
  }

  async findByQuest(questId: string, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      return await this.find({
        where: { questId } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByQuest:', error);
      throw error;
    }
  }

  async findByUserAndQuest(userId: string, questId: string, relations: string[] = []): Promise<QuestProgress | null> {
    try {
      return await this.findOne({
        where: { userId, questId } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByUserAndQuest:', error);
      throw error;
    }
  }

  async findByStatus(status: QuestProgressStatus, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      return await this.find({
        where: { status } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByStatus:', error);
      throw error;
    }
  }

  async findCompletedByUser(userId: string, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      return await this.find({
        where: {
          userId,
          status: QuestProgressStatus.COMPLETED
        } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findCompletedByUser:', error);
      throw error;
    }
  }

  async findInProgressByUser(userId: string, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      return await this.find({
        where: {
          userId,
          status: QuestProgressStatus.IN_PROGRESS
        } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findInProgressByUser:', error);
      throw error;
    }
  }

  async findExpiredByUser(userId: string, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      return await this.find({
        where: {
          userId,
          status: QuestProgressStatus.EXPIRED
        } as FindOptionsWhere<QuestProgress>,
        relations
      });
    } catch (error) {
      logger.error('Error in findExpiredByUser:', error);
      throw error;
    }
  }

  async findRecentlyCompleted(days: number = 7, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await this.find({
        where: {
          status: QuestProgressStatus.COMPLETED,
          completedAt: Between(startDate, new Date())
        } as FindOptionsWhere<QuestProgress>,
        relations,
        order: { completedAt: 'DESC' }
      });
    } catch (error) {
      logger.error('Error in findRecentlyCompleted:', error);
      throw error;
    }
  }

  async findExpiring(hours: number = 24, relations: string[] = []): Promise<QuestProgress[]> {
    try {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + hours);

      return await this.find({
        where: {
          status: QuestProgressStatus.IN_PROGRESS,
          expiresAt: Between(new Date(), futureDate)
        } as FindOptionsWhere<QuestProgress>,
        relations,
        order: { expiresAt: 'ASC' }
      });
    } catch (error) {
      logger.error('Error in findExpiring:', error);
      throw error;
    }
  }

  async updateObjectiveProgress(id: string, objectiveIndex: number, value: number): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.updateObjectiveProgress(objectiveIndex, value);
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in updateObjectiveProgress:', error);
      throw error;
    }
  }

  async startQuest(id: string): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.start();
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in startQuest:', error);
      throw error;
    }
  }

  async completeQuest(id: string): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.complete();
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in completeQuest:', error);
      throw error;
    }
  }

  async failQuest(id: string): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.fail();
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in failQuest:', error);
      throw error;
    }
  }

  async expireQuest(id: string): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.expire();
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in expireQuest:', error);
      throw error;
    }
  }

  async collectRewards(id: string): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.collectRewards();
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in collectRewards:', error);
      throw error;
    }
  }

  async resetQuest(id: string): Promise<QuestProgress | null> {
    try {
      const questProgress = await this.findById(id);
      if (!questProgress) return null;

      questProgress.reset();
      return await this.repository.save(questProgress);
    } catch (error) {
      logger.error('Error in resetQuest:', error);
      throw error;
    }
  }
} 