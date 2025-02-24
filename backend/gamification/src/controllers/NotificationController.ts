import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { NotificationService } from '../services/NotificationService';
import { NotificationType, NotificationPriority } from '../models/Notification';
import { logger } from '../utils/logger';

export class NotificationController extends BaseController {
  private notificationService: NotificationService;

  constructor() {
    super();
    this.notificationService = new NotificationService();
  }

  createNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, [
        'userId',
        'title',
        'message',
        'type'
      ]);

      this.validateEnumParam(req.body.type, NotificationType, 'type');
      if (req.body.priority) {
        this.validateEnumParam(req.body.priority, NotificationPriority, 'priority');
      }
      if (req.body.expiresAt) {
        this.validateDateParam(req.body.expiresAt);
      }

      const notification = await this.notificationService.createNotification(req.body);
      return this.handleSuccess(res, notification, 'Notification created successfully');
    });
  };

  getNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const notification = await this.notificationService.getNotification(req.params.id);
      return this.handleSuccess(res, notification);
    });
  };

  getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);

      const options: any = {};
      if (req.query.type) {
        this.validateEnumParam(req.query.type as string, NotificationType, 'type');
        options.type = req.query.type;
      }
      if (req.query.priority) {
        this.validateEnumParam(req.query.priority as string, NotificationPriority, 'priority');
        options.priority = req.query.priority;
      }

      const notifications = await this.notificationService.getUserNotifications(req.params.userId, options);
      return this.handleSuccess(res, notifications);
    });
  };

  getUnreadNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const notifications = await this.notificationService.getUnreadNotifications(req.params.userId);
      return this.handleSuccess(res, notifications);
    });
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const notification = await this.notificationService.markAsRead(req.params.id);
      return this.handleSuccess(res, notification, 'Notification marked as read');
    });
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      await this.notificationService.markAllAsRead(req.params.userId);
      return this.handleSuccess(res, null, 'All notifications marked as read');
    });
  };

  archiveNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const notification = await this.notificationService.archiveNotification(req.params.id);
      return this.handleSuccess(res, notification, 'Notification archived');
    });
  };

  archiveAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      await this.notificationService.archiveAllRead(req.params.userId);
      return this.handleSuccess(res, null, 'All read notifications archived');
    });
  };

  deleteExpiredNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      await this.notificationService.deleteExpiredNotifications();
      return this.handleSuccess(res, null, 'Expired notifications deleted');
    });
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const count = await this.notificationService.getUnreadCount(req.params.userId);
      return this.handleSuccess(res, { count });
    });
  };

  createAchievementNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, ['userId', 'achievementName', 'data']);
      const notification = await this.notificationService.createAchievementNotification(
        req.body.userId,
        req.body.achievementName,
        req.body.data
      );
      return this.handleSuccess(res, notification, 'Achievement notification created');
    });
  };

  createQuestNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, ['userId', 'questName', 'data']);
      const notification = await this.notificationService.createQuestNotification(
        req.body.userId,
        req.body.questName,
        req.body.data
      );
      return this.handleSuccess(res, notification, 'Quest notification created');
    });
  };

  createLevelUpNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, ['userId', 'newLevel']);
      this.validateNumberParam(req.body.newLevel, 'newLevel');
      const notification = await this.notificationService.createLevelUpNotification(
        req.body.userId,
        parseInt(req.body.newLevel)
      );
      return this.handleSuccess(res, notification, 'Level up notification created');
    });
  };

  createRewardNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, ['userId', 'rewardName', 'data']);
      const notification = await this.notificationService.createRewardNotification(
        req.body.userId,
        req.body.rewardName,
        req.body.data
      );
      return this.handleSuccess(res, notification, 'Reward notification created');
    });
  };
} 