import { User, UserStatus } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AchievementProgressRepository } from '../repositories/AchievementProgressRepository';
import { QuestProgressRepository } from '../repositories/QuestProgressRepository';
import { publishEvent } from '../config/rabbitmq';
import { redisSet, redisGet } from '../config/redis';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';

export class UserService {
  private userRepository: UserRepository;
  private achievementProgressRepository: AchievementProgressRepository;
  private questProgressRepository: QuestProgressRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.achievementProgressRepository = new AchievementProgressRepository();
    this.questProgressRepository = new QuestProgressRepository();
  }

  async createUser(data: {
    externalId: string;
    username: string;
    avatar?: string;
  }): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByExternalId(data.externalId);
      if (existingUser) {
        throw new APIError(409, 'User already exists');
      }

      // Create new user
      const user = await this.userRepository.create({
        ...data,
        level: 1,
        experience: 0,
        totalPoints: 0,
        status: UserStatus.ACTIVE,
        preferences: {},
        stats: {
          gamesPlayed: 0,
          achievementsCompleted: 0,
          questsCompleted: 0,
          timeSpent: 0
        }
      });

      // Publish user creation event
      await publishEvent('user.created', {
        userId: user.id,
        externalId: user.externalId,
        timestamp: new Date()
      });

      // Cache user data
      await this.cacheUserData(user);

      return user;
    } catch (error) {
      logger.error('Error in createUser:', error);
      throw error;
    }
  }

  async getUserById(id: string, relations: string[] = []): Promise<User> {
    try {
      // Try to get from cache first
      const cachedUser = await redisGet<User>(`user:${id}`);
      if (cachedUser && relations.length === 0) {
        return cachedUser;
      }

      const user = await this.userRepository.findById(id, relations);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      // Update cache if no relations were requested
      if (relations.length === 0) {
        await this.cacheUserData(user);
      }

      return user;
    } catch (error) {
      logger.error('Error in getUserById:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const user = await this.userRepository.update(id, data);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      // Publish user update event
      await publishEvent('user.updated', {
        userId: user.id,
        updates: data,
        timestamp: new Date()
      });

      // Update cache
      await this.cacheUserData(user);

      return user;
    } catch (error) {
      logger.error('Error in updateUser:', error);
      throw error;
    }
  }

  async addExperience(id: string, amount: number): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      const oldLevel = user.level;
      const updatedUser = await this.userRepository.updateExperience(id, amount);

      // Check for level up
      if (updatedUser.level > oldLevel) {
        await publishEvent('user.levelUp', {
          userId: id,
          oldLevel,
          newLevel: updatedUser.level,
          timestamp: new Date()
        });
      }

      // Update cache
      await this.cacheUserData(updatedUser);

      return updatedUser;
    } catch (error) {
      logger.error('Error in addExperience:', error);
      throw error;
    }
  }

  async addPoints(id: string, amount: number): Promise<User> {
    try {
      const updatedUser = await this.userRepository.updatePoints(id, amount);
      if (!updatedUser) {
        throw new APIError(404, 'User not found');
      }

      // Publish points update event
      await publishEvent('user.pointsUpdated', {
        userId: id,
        pointsAdded: amount,
        newTotal: updatedUser.totalPoints,
        timestamp: new Date()
      });

      // Update cache
      await this.cacheUserData(updatedUser);

      return updatedUser;
    } catch (error) {
      logger.error('Error in addPoints:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    try {
      const updatedUser = await this.userRepository.updateStatus(id, status);
      if (!updatedUser) {
        throw new APIError(404, 'User not found');
      }

      // Publish status update event
      await publishEvent('user.statusUpdated', {
        userId: id,
        newStatus: status,
        timestamp: new Date()
      });

      // Update cache
      await this.cacheUserData(updatedUser);

      return updatedUser;
    } catch (error) {
      logger.error('Error in updateStatus:', error);
      throw error;
    }
  }

  async getUserProgress(id: string): Promise<{
    achievements: number;
    quests: number;
    totalPoints: number;
    level: number;
    experienceProgress: number;
  }> {
    try {
      const [user, achievements, quests] = await Promise.all([
        this.userRepository.findById(id),
        this.achievementProgressRepository.findCompletedByUser(id),
        this.questProgressRepository.findCompletedByUser(id)
      ]);

      if (!user) {
        throw new APIError(404, 'User not found');
      }

      return {
        achievements: achievements.length,
        quests: quests.length,
        totalPoints: user.totalPoints,
        level: user.level,
        experienceProgress: user.getLevelProgress()
      };
    } catch (error) {
      logger.error('Error in getUserProgress:', error);
      throw error;
    }
  }

  async updateUserStats(id: string, stats: Record<string, any>): Promise<User> {
    try {
      const updatedUser = await this.userRepository.updateStats(id, stats);
      if (!updatedUser) {
        throw new APIError(404, 'User not found');
      }

      // Publish stats update event
      await publishEvent('user.statsUpdated', {
        userId: id,
        stats,
        timestamp: new Date()
      });

      // Update cache
      await this.cacheUserData(updatedUser);

      return updatedUser;
    } catch (error) {
      logger.error('Error in updateUserStats:', error);
      throw error;
    }
  }

  async updateUserPreferences(id: string, preferences: Record<string, any>): Promise<User> {
    try {
      const updatedUser = await this.userRepository.updatePreferences(id, preferences);
      if (!updatedUser) {
        throw new APIError(404, 'User not found');
      }

      // Update cache
      await this.cacheUserData(updatedUser);

      return updatedUser;
    } catch (error) {
      logger.error('Error in updateUserPreferences:', error);
      throw error;
    }
  }

  private async cacheUserData(user: User): Promise<void> {
    try {
      await redisSet(`user:${user.id}`, user, 3600); // Cache for 1 hour
    } catch (error) {
      logger.error('Error caching user data:', error);
      // Don't throw error as caching failure shouldn't break the application
    }
  }
} 