import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Reward, RewardType, RewardStatus } from '../models/Reward';
import { logger } from '../utils/logger';

export class RewardRepository extends BaseRepository<Reward> {
  constructor() {
    super(Reward);
  }

  async findByUser(userId: string, relations: string[] = []): Promise<Reward[]> {
    try {
      return await this.find({
        where: { userId } as FindOptionsWhere<Reward>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByUser:', error);
      throw error;
    }
  }

  async findAvailableByUser(userId: string, relations: string[] = []): Promise<Reward[]> {
    try {
      const now = new Date();
      return await this.find({
        where: [
          {
            userId,
            status: RewardStatus.AVAILABLE,
            expiresAt: IsNull()
          },
          {
            userId,
            status: RewardStatus.AVAILABLE,
            expiresAt: MoreThanOrEqual(now)
          }
        ] as FindOptionsWhere<Reward>[],
        relations
      });
    } catch (error) {
      logger.error('Error in findAvailableByUser:', error);
      throw error;
    }
  }

  async findByType(userId: string, type: RewardType, relations: string[] = []): Promise<Reward[]> {
    try {
      return await this.find({
        where: { userId, type } as FindOptionsWhere<Reward>,
        relations
      });
    } catch (error) {
      logger.error('Error in findByType:', error);
      throw error;
    }
  }

  async findExpired(relations: string[] = []): Promise<Reward[]> {
    try {
      const now = new Date();
      return await this.find({
        where: {
          status: RewardStatus.AVAILABLE,
          expiresAt: LessThanOrEqual(now)
        } as FindOptionsWhere<Reward>,
        relations
      });
    } catch (error) {
      logger.error('Error in findExpired:', error);
      throw error;
    }
  }

  async claimReward(id: string): Promise<Reward | null> {
    try {
      const reward = await this.findById(id);
      if (!reward) return null;

      reward.claim();
      return await this.repository.save(reward);
    } catch (error) {
      logger.error('Error in claimReward:', error);
      throw error;
    }
  }

  async updateExpiredStatus(): Promise<void> {
    try {
      const expiredRewards = await this.findExpired();
      for (const reward of expiredRewards) {
        reward.updateStatus();
        await this.repository.save(reward);
      }
    } catch (error) {
      logger.error('Error in updateExpiredStatus:', error);
      throw error;
    }
  }

  async getRewardStats(userId: string): Promise<{
    total: number;
    available: number;
    claimed: number;
    expired: number;
  }> {
    try {
      const rewards = await this.findByUser(userId);
      return {
        total: rewards.length,
        available: rewards.filter(r => r.status === RewardStatus.AVAILABLE).length,
        claimed: rewards.filter(r => r.status === RewardStatus.CLAIMED).length,
        expired: rewards.filter(r => r.status === RewardStatus.EXPIRED).length
      };
    } catch (error) {
      logger.error('Error in getRewardStats:', error);
      throw error;
    }
  }
} 