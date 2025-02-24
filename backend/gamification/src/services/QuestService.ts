import { Quest, QuestType, QuestDifficulty } from '../models/Quest';
import { QuestProgress, QuestProgressStatus } from '../models/QuestProgress';
import { QuestRepository } from '../repositories/QuestRepository';
import { QuestProgressRepository } from '../repositories/QuestProgressRepository';
import { UserService } from './UserService';
import { publishEvent } from '../config/rabbitmq';
import { redisSet, redisGet } from '../config/redis';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';
import { LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';

export class QuestService {
  private questRepository: QuestRepository;
  private progressRepository: QuestProgressRepository;
  private userService: UserService;

  constructor() {
    this.questRepository = new QuestRepository();
    this.progressRepository = new QuestProgressRepository();
    this.userService = new UserService();
  }

  async createQuest(data: {
    name: string;
    description: string;
    type: QuestType;
    difficulty: QuestDifficulty;
    experienceReward: number;
    pointsReward: number;
    objectives: {
      type: string;
      target: number;
      description: string;
      order: number;
    }[];
    additionalRewards?: Record<string, any>;
    icon?: string;
    requiredLevel?: number;
    prerequisites?: {
      questIds?: string[];
      achievements?: string[];
      level?: number;
      stats?: Record<string, number>;
    };
    startDate?: Date;
    endDate?: Date;
    timeLimit?: string;
  }): Promise<Quest> {
    try {
      const quest = await this.questRepository.create({
        ...data,
        isActive: true
      });

      await publishEvent('quest.created', {
        questId: quest.id,
        type: quest.type,
        timestamp: new Date()
      });

      return quest;
    } catch (error) {
      logger.error('Error in createQuest:', error);
      throw error;
    }
  }

  async getQuest(id: string): Promise<Quest> {
    const quest = await this.questRepository.findById(id);
    if (!quest) {
      throw new APIError(404, 'Quest not found');
    }
    return quest;
  }

  async updateQuest(id: string, data: Partial<Quest>): Promise<Quest> {
    try {
      const quest = await this.questRepository.update(id, data);
      if (!quest) {
        throw new APIError(404, 'Quest not found');
      }

      await publishEvent('quest.updated', {
        questId: id,
        updates: data,
        timestamp: new Date()
      });

      return quest;
    } catch (error) {
      logger.error('Error in updateQuest:', error);
      throw error;
    }
  }

  async getAvailableQuests(userId: string): Promise<Quest[]> {
    try {
      const user = await this.userService.getUser(userId);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      const quests = await this.questRepository.findAvailable();
      return quests.filter(quest => quest.requiredLevel <= user.level);
    } catch (error) {
      logger.error('Error in getAvailableQuests:', error);
      throw error;
    }
  }

  async startQuest(userId: string, questId: string): Promise<QuestProgress> {
    try {
      const [user, quest] = await Promise.all([
        this.userService.getUser(userId),
        this.getQuest(questId)
      ]);

      // Validate prerequisites
      await this.validatePrerequisites(userId, quest);

      let progress = await this.progressRepository.findByUserAndQuest(userId, questId);
      if (!progress) {
        progress = await this.progressRepository.create({
          userId,
          questId,
          status: QuestProgressStatus.NOT_STARTED,
          expiresAt: quest.timeLimit ? this.calculateExpiryDate(quest.timeLimit) : null
        });
      }

      if (progress.status !== QuestProgressStatus.NOT_STARTED) {
        throw new APIError(400, 'Quest already started or completed');
      }

      progress.start();
      const updatedProgress = await this.progressRepository.save(progress);

      await publishEvent('quest.started', {
        userId,
        questId,
        timestamp: new Date()
      });

      return updatedProgress;
    } catch (error) {
      logger.error('Error in startQuest:', error);
      throw error;
    }
  }

  async updateObjectiveProgress(
    userId: string,
    questId: string,
    objectiveIndex: number,
    value: number
  ): Promise<QuestProgress> {
    try {
      const progress = await this.progressRepository.findByUserAndQuest(userId, questId, ['quest']);
      if (!progress) {
        throw new APIError(404, 'Quest progress not found');
      }

      if (progress.status !== QuestProgressStatus.IN_PROGRESS) {
        throw new APIError(400, 'Quest is not in progress');
      }

      const oldStatus = progress.status;
      progress.updateObjectiveProgress(objectiveIndex, value);
      const updatedProgress = await this.progressRepository.save(progress);

      // Handle completion
      if (oldStatus !== QuestProgressStatus.COMPLETED && updatedProgress.status === QuestProgressStatus.COMPLETED) {
        await this.handleQuestCompletion(userId, updatedProgress.quest);
      }

      await publishEvent('quest.progress.updated', {
        userId,
        questId,
        objectiveIndex,
        value,
        status: updatedProgress.status,
        timestamp: new Date()
      });

      return updatedProgress;
    } catch (error) {
      logger.error('Error in updateObjectiveProgress:', error);
      throw error;
    }
  }

  private async handleQuestCompletion(userId: string, quest: Quest): Promise<void> {
    try {
      // Award experience points
      if (quest.experienceReward > 0) {
        await this.userService.addExperience(userId, quest.experienceReward);
      }

      // Award points
      if (quest.pointsReward > 0) {
        await this.userService.addPoints(userId, quest.pointsReward);
      }

      // Update user stats
      await this.userService.updateUserStats(userId, {
        questsCompleted: { $inc: 1 }
      });

      // Handle additional rewards
      if (quest.additionalRewards) {
        await this.processAdditionalRewards(userId, quest.additionalRewards);
      }

      await publishEvent('quest.completed', {
        userId,
        questId: quest.id,
        type: quest.type,
        rewards: {
          experience: quest.experienceReward,
          points: quest.pointsReward,
          additional: quest.additionalRewards
        },
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error in handleQuestCompletion:', error);
      throw error;
    }
  }

  private async processAdditionalRewards(userId: string, rewards: Record<string, any>): Promise<void> {
    // Implementation depends on reward types
    // Example: items, badges, special permissions, etc.
    try {
      // Process each reward type
      for (const [type, value] of Object.entries(rewards)) {
        await publishEvent('reward.granted', {
          userId,
          type,
          value,
          timestamp: new Date()
        });
      }
    } catch (error) {
      logger.error('Error in processAdditionalRewards:', error);
      throw error;
    }
  }

  private async validatePrerequisites(userId: string, quest: Quest): Promise<void> {
    if (!quest.prerequisites) return;

    const { questIds, achievements, level, stats } = quest.prerequisites;

    // Check level requirement
    if (level) {
      const user = await this.userService.getUser(userId);
      if (user.level < level) {
        throw new APIError(400, 'Level requirement not met');
      }
    }

    // Check quest prerequisites
    if (questIds?.length) {
      const completedQuests = await this.progressRepository.findCompletedByUser(userId);
      const completedQuestIds = new Set(completedQuests.map(p => p.questId));
      const missingQuests = questIds.filter(id => !completedQuestIds.has(id));
      
      if (missingQuests.length > 0) {
        throw new APIError(400, 'Quest prerequisites not met');
      }
    }

    // Check achievement prerequisites
    if (achievements?.length) {
      const userProgress = await this.userService.getUserProgress(userId);
      if (userProgress.achievements < achievements.length) {
        throw new APIError(400, 'Achievement prerequisites not met');
      }
    }

    // Check stats prerequisites
    if (stats) {
      const user = await this.userService.getUser(userId);
      for (const [stat, required] of Object.entries(stats)) {
        if (!user.stats[stat] || user.stats[stat] < required) {
          throw new APIError(400, 'Stat requirements not met');
        }
      }
    }
  }

  private calculateExpiryDate(timeLimit: string): Date {
    const now = new Date();
    // Parse timeLimit string (e.g., '24h', '7d', '30d')
    const value = parseInt(timeLimit);
    const unit = timeLimit.slice(-1);
    
    switch (unit) {
      case 'h':
        now.setHours(now.getHours() + value);
        break;
      case 'd':
        now.setDate(now.getDate() + value);
        break;
      default:
        throw new Error('Invalid time limit format');
    }
    
    return now;
  }

  async getQuestStats(): Promise<{
    total: number;
    active: number;
    daily: number;
    weekly: number;
    expiringSoon: number;
  }> {
    try {
      const [total, active, daily, weekly, expiring] = await Promise.all([
        this.questRepository.count(),
        this.questRepository.count({ where: { isActive: true } }),
        this.questRepository.findDailyQuests(),
        this.questRepository.findWeeklyQuests(),
        this.questRepository.findExpiring(7)
      ]);

      return {
        total,
        active,
        daily: daily.length,
        weekly: weekly.length,
        expiringSoon: expiring.length
      };
    } catch (error) {
      logger.error('Error in getQuestStats:', error);
      throw error;
    }
  }
} 