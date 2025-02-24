import { Request, Response, NextFunction } from 'express';
import { NotificationController } from '../../controllers/NotificationController';
import { NotificationService } from '../../services/NotificationService';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../models/Notification';
import { APIError } from '../../middleware/errorHandler';

// Mock NotificationService
jest.mock('../../services/NotificationService');

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockNotification: Partial<Notification>;

  beforeEach(() => {
    controller = new NotificationController();
    mockNotification = {
      id: 'test-notification-id',
      userId: 'test-user-id',
      title: 'Test Notification',
      message: 'Test Message',
      type: NotificationType.ACHIEVEMENT,
      priority: NotificationPriority.HIGH,
      status: NotificationStatus.UNREAD,
      data: { achievementId: 'test-achievement' },
      isActionable: true,
      actionUrl: '/achievements/test-achievement',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRequest = {
      params: { id: mockNotification.id, userId: mockNotification.userId },
      query: {},
      body: {},
      path: '/test',
      method: 'GET'
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup NotificationService mock implementations
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.createNotification.mockResolvedValue(mockNotification as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.getNotification.mockResolvedValue(mockNotification as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.getUserNotifications.mockResolvedValue([mockNotification as Notification]);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.getUnreadNotifications.mockResolvedValue([mockNotification as Notification]);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.markAsRead.mockResolvedValue({
      ...mockNotification,
      status: NotificationStatus.READ,
      readAt: new Date()
    } as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.markAllAsRead.mockResolvedValue();
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.archiveNotification.mockResolvedValue({
      ...mockNotification,
      status: NotificationStatus.ARCHIVED
    } as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.archiveAllRead.mockResolvedValue();
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.deleteExpiredNotifications.mockResolvedValue();
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.getUnreadCount.mockResolvedValue(5);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.createAchievementNotification.mockResolvedValue(mockNotification as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.createQuestNotification.mockResolvedValue(mockNotification as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.createLevelUpNotification.mockResolvedValue(mockNotification as Notification);
    (NotificationService as jest.MockedClass<typeof NotificationService>).prototype.createRewardNotification.mockResolvedValue(mockNotification as Notification);
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const notificationData = {
        userId: 'test-user-id',
        title: 'New Notification',
        message: 'Test Message',
        type: NotificationType.ACHIEVEMENT,
        priority: NotificationPriority.HIGH,
        data: { achievementId: 'test-achievement' },
        isActionable: true,
        actionUrl: '/achievements/test-achievement'
      };
      mockRequest.body = notificationData;

      await controller.createNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.createNotification).toHaveBeenCalledWith(notificationData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification,
        message: 'Notification created successfully'
      });
    });

    it('should validate required fields', async () => {
      mockRequest.body = { title: 'Test' }; // Missing required fields

      await controller.createNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getNotification', () => {
    it('should get notification successfully', async () => {
      await controller.getNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.getNotification).toHaveBeenCalledWith(mockNotification.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification
      });
    });

    it('should handle notification not found', async () => {
      (NotificationService.prototype.getNotification as jest.Mock).mockRejectedValue(
        new APIError(404, 'Notification not found')
      );

      await controller.getNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getUserNotifications', () => {
    it('should get user notifications successfully', async () => {
      mockRequest.query = { type: NotificationType.ACHIEVEMENT };

      await controller.getUserNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.getUserNotifications).toHaveBeenCalledWith(
        mockRequest.params.userId,
        { type: NotificationType.ACHIEVEMENT }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockNotification]
      });
    });
  });

  describe('getUnreadNotifications', () => {
    it('should get unread notifications successfully', async () => {
      await controller.getUnreadNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.getUnreadNotifications).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockNotification]
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      await controller.markAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.markAsRead).toHaveBeenCalledWith(mockNotification.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          status: NotificationStatus.READ,
          readAt: expect.any(Date)
        }),
        message: 'Notification marked as read'
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      await controller.markAllAsRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.markAllAsRead).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read'
      });
    });
  });

  describe('archiveNotification', () => {
    it('should archive notification successfully', async () => {
      await controller.archiveNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.archiveNotification).toHaveBeenCalledWith(mockNotification.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          status: NotificationStatus.ARCHIVED
        }),
        message: 'Notification archived'
      });
    });
  });

  describe('archiveAllRead', () => {
    it('should archive all read notifications successfully', async () => {
      await controller.archiveAllRead(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.archiveAllRead).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'All read notifications archived'
      });
    });
  });

  describe('deleteExpiredNotifications', () => {
    it('should delete expired notifications successfully', async () => {
      await controller.deleteExpiredNotifications(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.deleteExpiredNotifications).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Expired notifications deleted'
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count successfully', async () => {
      await controller.getUnreadCount(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.getUnreadCount).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { count: 5 }
      });
    });
  });

  describe('createAchievementNotification', () => {
    it('should create achievement notification successfully', async () => {
      mockRequest.body = {
        userId: 'test-user-id',
        achievementName: 'Test Achievement',
        data: { achievementId: 'test-achievement' }
      };

      await controller.createAchievementNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.createAchievementNotification).toHaveBeenCalledWith(
        mockRequest.body.userId,
        mockRequest.body.achievementName,
        mockRequest.body.data
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification,
        message: 'Achievement notification created'
      });
    });
  });

  describe('createQuestNotification', () => {
    it('should create quest notification successfully', async () => {
      mockRequest.body = {
        userId: 'test-user-id',
        questName: 'Test Quest',
        data: { questId: 'test-quest' }
      };

      await controller.createQuestNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.createQuestNotification).toHaveBeenCalledWith(
        mockRequest.body.userId,
        mockRequest.body.questName,
        mockRequest.body.data
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification,
        message: 'Quest notification created'
      });
    });
  });

  describe('createLevelUpNotification', () => {
    it('should create level up notification successfully', async () => {
      mockRequest.body = {
        userId: 'test-user-id',
        newLevel: 10
      };

      await controller.createLevelUpNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.createLevelUpNotification).toHaveBeenCalledWith(
        mockRequest.body.userId,
        mockRequest.body.newLevel
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification,
        message: 'Level up notification created'
      });
    });
  });

  describe('createRewardNotification', () => {
    it('should create reward notification successfully', async () => {
      mockRequest.body = {
        userId: 'test-user-id',
        rewardName: 'Test Reward',
        data: { rewardId: 'test-reward' }
      };

      await controller.createRewardNotification(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(NotificationService.prototype.createRewardNotification).toHaveBeenCalledWith(
        mockRequest.body.userId,
        mockRequest.body.rewardName,
        mockRequest.body.data
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockNotification,
        message: 'Reward notification created'
      });
    });
  });
}); 