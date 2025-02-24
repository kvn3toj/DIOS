import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../models/Notification';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { UserService } from './UserService';
import { publishEvent } from '../config/rabbitmq';
import { redisSet, redisGet } from '../config/redis';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private userService: UserService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.userService = new UserService();
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    data?: Record<string, any>;
    expiresAt?: Date;
    isActionable?: boolean;
    actionUrl?: string;
  }): Promise<Notification> {
    try {
      // Verify user exists
      const user = await this.userService.getUser(data.userId);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      const notification = await this.notificationRepository.create({
        ...data,
        status: NotificationStatus.UNREAD,
        priority: data.priority || NotificationPriority.MEDIUM
      });

      await publishEvent('notification.created', {
        notificationId: notification.id,
        userId: notification.userId,
        type: notification.type,
        timestamp: new Date()
      });

      return notification;
    } catch (error) {
      logger.error('Error in createNotification:', error);
      throw error;
    }
  }

  async getNotification(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new APIError(404, 'Notification not found');
    }
    return notification;
  }

  async getUserNotifications(userId: string, options?: {
    type?: NotificationType;
    status?: NotificationStatus;
    priority?: NotificationPriority;
  }): Promise<Notification[]> {
    try {
      if (options?.type) {
        return await this.notificationRepository.findByType(userId, options.type);
      }
      if (options?.priority) {
        return await this.notificationRepository.findByPriority(userId, options.priority);
      }
      return await this.notificationRepository.findByUser(userId);
    } catch (error) {
      logger.error('Error in getUserNotifications:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      return await this.notificationRepository.findUnreadByUser(userId);
    } catch (error) {
      logger.error('Error in getUnreadNotifications:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.markAsRead(id);
      if (!notification) {
        throw new APIError(404, 'Notification not found');
      }

      await publishEvent('notification.read', {
        notificationId: id,
        userId: notification.userId,
        timestamp: new Date()
      });

      return notification;
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository.markAllAsRead(userId);

      await publishEvent('notification.all_read', {
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  async archiveNotification(id: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.archive(id);
      if (!notification) {
        throw new APIError(404, 'Notification not found');
      }

      await publishEvent('notification.archived', {
        notificationId: id,
        userId: notification.userId,
        timestamp: new Date()
      });

      return notification;
    } catch (error) {
      logger.error('Error in archiveNotification:', error);
      throw error;
    }
  }

  async archiveAllRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository.archiveAll(userId);

      await publishEvent('notification.all_archived', {
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error in archiveAllRead:', error);
      throw error;
    }
  }

  async deleteExpiredNotifications(): Promise<void> {
    try {
      await this.notificationRepository.deleteExpired();
    } catch (error) {
      logger.error('Error in deleteExpiredNotifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.notificationRepository.getUnreadCount(userId);
    } catch (error) {
      logger.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  // Helper methods for creating specific types of notifications
  async createAchievementNotification(userId: string, achievementName: string, data: Record<string, any>): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: 'Achievement Unlocked!',
      message: `You've earned the "${achievementName}" achievement!`,
      type: NotificationType.ACHIEVEMENT,
      priority: NotificationPriority.HIGH,
      data,
      isActionable: true,
      actionUrl: `/achievements/${data.achievementId}`
    });
  }

  async createQuestNotification(userId: string, questName: string, data: Record<string, any>): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: 'Quest Completed!',
      message: `You've completed the "${questName}" quest!`,
      type: NotificationType.QUEST,
      priority: NotificationPriority.HIGH,
      data,
      isActionable: true,
      actionUrl: `/quests/${data.questId}`
    });
  }

  async createLevelUpNotification(userId: string, newLevel: number): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`,
      type: NotificationType.LEVEL_UP,
      priority: NotificationPriority.HIGH,
      data: { newLevel },
      isActionable: true,
      actionUrl: '/profile'
    });
  }

  async createRewardNotification(userId: string, rewardName: string, data: Record<string, any>): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: 'Reward Earned!',
      message: `You've earned a new reward: ${rewardName}!`,
      type: NotificationType.REWARD,
      priority: NotificationPriority.MEDIUM,
      data,
      isActionable: true,
      actionUrl: '/rewards'
    });
  }
} 