import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '../models/Notification';
import { logger } from '../utils/logger';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(Notification);
  }

  async findByUser(userId: string, relations: string[] = []): Promise<Notification[]> {
    try {
      return await this.find({
        where: { userId } as FindOptionsWhere<Notification>,
        relations,
        order: {
          createdAt: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByUser:', error);
      throw error;
    }
  }

  async findUnreadByUser(userId: string, relations: string[] = []): Promise<Notification[]> {
    try {
      return await this.find({
        where: {
          userId,
          status: NotificationStatus.UNREAD
        } as FindOptionsWhere<Notification>,
        relations,
        order: {
          priority: 'DESC',
          createdAt: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findUnreadByUser:', error);
      throw error;
    }
  }

  async findByType(userId: string, type: NotificationType, relations: string[] = []): Promise<Notification[]> {
    try {
      return await this.find({
        where: { userId, type } as FindOptionsWhere<Notification>,
        relations,
        order: {
          createdAt: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByType:', error);
      throw error;
    }
  }

  async findByPriority(userId: string, priority: NotificationPriority, relations: string[] = []): Promise<Notification[]> {
    try {
      return await this.find({
        where: { userId, priority } as FindOptionsWhere<Notification>,
        relations,
        order: {
          createdAt: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByPriority:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<Notification | null> {
    try {
      const notification = await this.findById(id);
      if (!notification) return null;

      notification.markAsRead();
      return await this.repository.save(notification);
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.repository.update(
        { userId, status: NotificationStatus.UNREAD } as FindOptionsWhere<Notification>,
        { status: NotificationStatus.READ, readAt: new Date() }
      );
    } catch (error) {
      logger.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  async archive(id: string): Promise<Notification | null> {
    try {
      const notification = await this.findById(id);
      if (!notification) return null;

      notification.archive();
      return await this.repository.save(notification);
    } catch (error) {
      logger.error('Error in archive:', error);
      throw error;
    }
  }

  async archiveAll(userId: string): Promise<void> {
    try {
      await this.repository.update(
        { userId, status: NotificationStatus.READ } as FindOptionsWhere<Notification>,
        { status: NotificationStatus.ARCHIVED }
      );
    } catch (error) {
      logger.error('Error in archiveAll:', error);
      throw error;
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      await this.repository.delete({
        expiresAt: LessThanOrEqual(new Date())
      } as FindOptionsWhere<Notification>);
    } catch (error) {
      logger.error('Error in deleteExpired:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.count({
        where: {
          userId,
          status: NotificationStatus.UNREAD
        } as FindOptionsWhere<Notification>
      });
    } catch (error) {
      logger.error('Error in getUnreadCount:', error);
      throw error;
    }
  }
} 