import { FindOptionsWhere } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { User, UserStatus } from '../models/User';
import { logger } from '../utils/logger';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async findByExternalId(externalId: string): Promise<User | null> {
    try {
      return await this.findOne({
        where: { externalId } as FindOptionsWhere<User>
      });
    } catch (error) {
      logger.error('Error in findByExternalId:', error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.findOne({
        where: { username } as FindOptionsWhere<User>
      });
    } catch (error) {
      logger.error('Error in findByUsername:', error);
      throw error;
    }
  }

  async findActiveUsers(): Promise<User[]> {
    try {
      return await this.find({
        where: { status: UserStatus.ACTIVE } as FindOptionsWhere<User>
      });
    } catch (error) {
      logger.error('Error in findActiveUsers:', error);
      throw error;
    }
  }

  async updateExperience(id: string, amount: number): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      user.addExperience(amount);
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error in updateExperience:', error);
      throw error;
    }
  }

  async updatePoints(id: string, amount: number): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      user.addPoints(amount);
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error in updatePoints:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: UserStatus): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      switch (status) {
        case UserStatus.ACTIVE:
          user.activate();
          break;
        case UserStatus.INACTIVE:
          user.deactivate();
          break;
        case UserStatus.BANNED:
          user.ban();
          break;
      }

      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error in updateStatus:', error);
      throw error;
    }
  }

  async updateLastActive(id: string): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      user.updateLastActive();
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error in updateLastActive:', error);
      throw error;
    }
  }

  async findUsersAboveLevel(level: number): Promise<User[]> {
    try {
      return await this.find({
        where: { level: { $gte: level } } as any,
        order: { level: 'DESC' }
      });
    } catch (error) {
      logger.error('Error in findUsersAboveLevel:', error);
      throw error;
    }
  }

  async findTopUsers(limit: number = 10): Promise<User[]> {
    try {
      return await this.find({
        order: { totalPoints: 'DESC' },
        take: limit
      });
    } catch (error) {
      logger.error('Error in findTopUsers:', error);
      throw error;
    }
  }

  async updateStats(id: string, stats: Record<string, any>): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      user.stats = { ...user.stats, ...stats };
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error in updateStats:', error);
      throw error;
    }
  }

  async updatePreferences(id: string, preferences: Record<string, any>): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      user.preferences = { ...user.preferences, ...preferences };
      return await this.repository.save(user);
    } catch (error) {
      logger.error('Error in updatePreferences:', error);
      throw error;
    }
  }
} 