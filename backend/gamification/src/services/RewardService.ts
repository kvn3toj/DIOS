import { RewardRepository } from '../repositories/RewardRepository';
import { UserService } from './UserService';
import { NotificationService } from './NotificationService';
import { Reward, RewardType, RewardStatus } from '../models/Reward';
import { publishEvent } from '../config/rabbitmq';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';

export class RewardService {
  private rewardRepository: RewardRepository;
  private userService: UserService;
  private notificationService: NotificationService;

  constructor() {
    this.rewardRepository = new RewardRepository();
    this.userService = new UserService();
    this.notificationService = new NotificationService();
  }

  async createReward(data: {
    userId: string;
    name: string;
    description?: string;
    type: RewardType;
    value: {
      amount?: number;
      itemId?: string;
      metadata?: Record<string, any>;
    };
    icon?: string;
    expiresAt?: Date;
    source?: {
      type: 'ACHIEVEMENT' | 'QUEST' | 'LEVEL_UP' | 'SYSTEM';
      id: string;
      metadata?: Record<string, any>;
    };
  }): Promise<Reward> {
    try {
      // Verify user exists
      const user = await this.userService.getUser(data.userId);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      const reward = await this.rewardRepository.create(data);

      // Send notification
      await this.notificationService.createRewardNotification(
        data.userId,
        data.name,
        { rewardId: reward.id, ...data }
      );

      await publishEvent('reward.created', {
        rewardId: reward.id,
        userId: reward.userId,
        type: reward.type,
        timestamp: new Date()
      });

      return reward;
    } catch (error) {
      logger.error('Error in createReward:', error);
      throw error;
    }
  }

  async getReward(id: string): Promise<Reward> {
    const reward = await this.rewardRepository.findById(id);
    if (!reward) {
      throw new APIError(404, 'Reward not found');
    }
    return reward;
  }

  async getUserRewards(userId: string, options?: {
    type?: RewardType;
    status?: RewardStatus;
  }): Promise<Reward[]> {
    try {
      if (options?.type) {
        return await this.rewardRepository.findByType(userId, options.type);
      }
      return await this.rewardRepository.findByUser(userId);
    } catch (error) {
      logger.error('Error in getUserRewards:', error);
      throw error;
    }
  }

  async getAvailableRewards(userId: string): Promise<Reward[]> {
    try {
      return await this.rewardRepository.findAvailableByUser(userId);
    } catch (error) {
      logger.error('Error in getAvailableRewards:', error);
      throw error;
    }
  }

  async claimReward(id: string): Promise<Reward> {
    try {
      const reward = await this.rewardRepository.claimReward(id);
      if (!reward) {
        throw new APIError(404, 'Reward not found');
      }

      if (reward.status !== RewardStatus.CLAIMED) {
        throw new APIError(400, 'Reward cannot be claimed');
      }

      // Process the reward based on type
      switch (reward.type) {
        case RewardType.POINTS:
          await this.userService.addPoints(reward.userId, reward.value.amount || 0);
          break;
        case RewardType.EXPERIENCE:
          await this.userService.addExperience(reward.userId, reward.value.amount || 0);
          break;
        // Add other reward type processing as needed
      }

      await publishEvent('reward.claimed', {
        rewardId: reward.id,
        userId: reward.userId,
        type: reward.type,
        timestamp: new Date()
      });

      return reward;
    } catch (error) {
      logger.error('Error in claimReward:', error);
      throw error;
    }
  }

  async batchCreateRewards(rewards: {
    userId: string;
    name: string;
    description?: string;
    type: RewardType;
    value: {
      amount?: number;
      itemId?: string;
      metadata?: Record<string, any>;
    };
    icon?: string;
    expiresAt?: Date;
    source?: {
      type: 'ACHIEVEMENT' | 'QUEST' | 'LEVEL_UP' | 'SYSTEM';
      id: string;
      metadata?: Record<string, any>;
    };
  }[]): Promise<Reward[]> {
    try {
      const createdRewards = await Promise.all(
        rewards.map(reward => this.createReward(reward))
      );

      await publishEvent('rewards.batch_created', {
        count: createdRewards.length,
        timestamp: new Date()
      });

      return createdRewards;
    } catch (error) {
      logger.error('Error in batchCreateRewards:', error);
      throw error;
    }
  }

  async cleanupExpiredRewards(): Promise<void> {
    try {
      await this.rewardRepository.updateExpiredStatus();
    } catch (error) {
      logger.error('Error in cleanupExpiredRewards:', error);
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
      return await this.rewardRepository.getRewardStats(userId);
    } catch (error) {
      logger.error('Error in getRewardStats:', error);
      throw error;
    }
  }
} 