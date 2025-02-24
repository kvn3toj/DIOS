import { Achievement, AchievementType, AchievementRarity } from '../models/Achievement';
import { AchievementProgress, ProgressStatus } from '../models/AchievementProgress';
import { AchievementRepository } from '../repositories/AchievementRepository';
import { AchievementProgressRepository } from '../repositories/AchievementProgressRepository';
import { UserService } from './UserService';
import { publishEvent } from '../config/rabbitmq';
import { redisSet, redisGet } from '../config/redis';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';
import { LessThanOrEqual, IsNull, MoreThanOrEqual } from 'typeorm';

export class AchievementService {
  private achievementRepository: AchievementRepository;
  private progressRepository: AchievementProgressRepository;
  private userService: UserService;

  constructor() {
    this.achievementRepository = new AchievementRepository();
    this.progressRepository = new AchievementProgressRepository();
    this.userService = new UserService();
  }

  async createAchievement(data: {
    name: string;
    description: string;
    type: AchievementType;
    rarity: AchievementRarity;
    points: number;
    criteria: Record<string, any>;
    rewards?: Record<string, any>;
    icon?: string;
    isSecret?: boolean;
    requiredLevel?: number;
    availableUntil?: Date;
  }): Promise<Achievement> {
    try {
      const achievement = await this.achievementRepository.create({
        ...data,
        isActive: true
      });

      await publishEvent('achievement.created', {
        achievementId: achievement.id,
        type: achievement.type,
        timestamp: new Date()
      });

      return achievement;
    } catch (error) {
      logger.error('Error in createAchievement:', error);
      throw error;
    }
  }

  async getAchievement(id: string): Promise<Achievement> {
    const achievement = await this.achievementRepository.findById(id);
    if (!achievement) {
      throw new APIError(404, 'Achievement not found');
    }
    return achievement;
  }

  async updateAchievement(id: string, data: Partial<Achievement>): Promise<Achievement> {
    try {
      const achievement = await this.achievementRepository.update(id, data);
      if (!achievement) {
        throw new APIError(404, 'Achievement not found');
      }

      await publishEvent('achievement.updated', {
        achievementId: id,
        updates: data,
        timestamp: new Date()
      });

      return achievement;
    } catch (error) {
      logger.error('Error in updateAchievement:', error);
      throw error;
    }
  }

  async getAvailableAchievements(userId: string): Promise<Achievement[]> {
    try {
      const user = await this.userService.getUser(userId);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      return await this.achievementRepository.find({
        where: {
          isActive: true,
          requiredLevel: LessThanOrEqual(user.level),
          availableUntil: IsNull() || MoreThanOrEqual(new Date())
        }
      });
    } catch (error) {
      logger.error('Error in getAvailableAchievements:', error);
      throw error;
    }
  }

  async updateProgress(userId: string, achievementId: string, progress: number, metadata?: Record<string, any>): Promise<AchievementProgress> {
    try {
      let progressRecord = await this.progressRepository.findByUserAndAchievement(userId, achievementId);
      const achievement = await this.getAchievement(achievementId);

      if (!progressRecord) {
        progressRecord = await this.progressRepository.create({
          userId,
          achievementId,
          progress: 0,
          status: ProgressStatus.NOT_STARTED
        });
      }

      const oldStatus = progressRecord.status;
      progressRecord.updateProgress(progress);
      if (metadata) {
        progressRecord.metadata = { ...progressRecord.metadata, ...metadata };
      }

      const updatedProgress = await this.progressRepository.save(progressRecord);

      // Handle completion
      if (oldStatus !== ProgressStatus.COMPLETED && updatedProgress.status === ProgressStatus.COMPLETED) {
        await this.handleAchievementCompletion(userId, achievement);
      }

      await publishEvent('achievement.progress.updated', {
        userId,
        achievementId,
        progress,
        status: updatedProgress.status,
        timestamp: new Date()
      });

      return updatedProgress;
    } catch (error) {
      logger.error('Error in updateProgress:', error);
      throw error;
    }
  }

  private async handleAchievementCompletion(userId: string, achievement: Achievement): Promise<void> {
    try {
      // Award points
      if (achievement.points > 0) {
        await this.userService.addPoints(userId, achievement.points);
      }

      // Update user stats
      await this.userService.updateUserStats(userId, {
        achievementsCompleted: { $inc: 1 }
      });

      // Handle rewards
      if (achievement.rewards) {
        await this.processRewards(userId, achievement.rewards);
      }

      await publishEvent('achievement.completed', {
        userId,
        achievementId: achievement.id,
        type: achievement.type,
        points: achievement.points,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error in handleAchievementCompletion:', error);
      throw error;
    }
  }

  private async processRewards(userId: string, rewards: Record<string, any>): Promise<void> {
    // Implementation depends on reward types
    // Example: experience points, special items, badges, etc.
    try {
      if (rewards.experience) {
        await this.userService.addExperience(userId, rewards.experience);
      }
      // Add other reward type processing as needed
    } catch (error) {
      logger.error('Error in processRewards:', error);
      throw error;
    }
  }

  async getAchievementStats(): Promise<{
    total: number;
    active: number;
    secret: number;
    expiringSoon: number;
  }> {
    try {
      const [total, active, secret, expiring] = await Promise.all([
        this.achievementRepository.count(),
        this.achievementRepository.count({ where: { isActive: true } }),
        this.achievementRepository.count({ where: { isSecret: true } }),
        this.achievementRepository.findExpiring(7)
      ]);

      return {
        total,
        active,
        secret,
        expiringSoon: expiring.length
      };
    } catch (error) {
      logger.error('Error in getAchievementStats:', error);
      throw error;
    }
  }
} 