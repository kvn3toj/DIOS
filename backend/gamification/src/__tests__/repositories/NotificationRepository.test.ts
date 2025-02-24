import { NotificationRepository } from '../../repositories/NotificationRepository';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../models/Notification';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let testUser: User;
  let testNotification: Notification;

  beforeEach(async () => {
    repository = new NotificationRepository();
    testUser = await global.createTestUser();
    testNotification = await repository.create({
      userId: testUser.id,
      title: 'Test Notification',
      message: 'Test Message',
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      status: NotificationStatus.UNREAD
    });
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const data = {
        userId: testUser.id,
        title: 'Achievement Unlocked',
        message: 'You have earned a new achievement!',
        type: NotificationType.ACHIEVEMENT,
        priority: NotificationPriority.HIGH,
        status: NotificationStatus.UNREAD,
        data: { achievementId: 'test-id' },
        isActionable: true,
        actionUrl: '/achievements/test-id'
      };

      const notification = await repository.create(data);

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(data.userId);
      expect(notification.title).toBe(data.title);
      expect(notification.type).toBe(data.type);
      expect(notification.priority).toBe(data.priority);
      expect(notification.status).toBe(data.status);
      expect(notification.data).toEqual(data.data);
      expect(notification.isActionable).toBe(data.isActionable);
      expect(notification.actionUrl).toBe(data.actionUrl);
      expect(notification.createdAt).toBeDefined();
      expect(notification.updatedAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find notification by id', async () => {
      const notification = await repository.findById(testNotification.id);

      expect(notification).toBeDefined();
      expect(notification?.id).toBe(testNotification.id);
    });

    it('should return null for non-existent id', async () => {
      const notification = await repository.findById('non-existent-id');

      expect(notification).toBeNull();
    });
  });

  describe('findByUser', () => {
    beforeEach(async () => {
      // Create additional notifications
      await repository.create({
        userId: testUser.id,
        title: 'Quest Completed',
        message: 'You have completed a quest!',
        type: NotificationType.QUEST,
        priority: NotificationPriority.HIGH,
        status: NotificationStatus.UNREAD
      });

      await repository.create({
        userId: testUser.id,
        title: 'Level Up',
        message: 'You have reached level 10!',
        type: NotificationType.LEVEL_UP,
        priority: NotificationPriority.HIGH,
        status: NotificationStatus.READ,
        readAt: new Date()
      });
    });

    it('should find all notifications for user', async () => {
      const notifications = await repository.findByUser(testUser.id);

      expect(notifications.length).toBe(3);
      notifications.forEach(n => {
        expect(n.userId).toBe(testUser.id);
      });
    });

    it('should find notifications by type', async () => {
      const notifications = await repository.findByType(testUser.id, NotificationType.QUEST);

      expect(notifications.length).toBeGreaterThan(0);
      notifications.forEach(n => {
        expect(n.userId).toBe(testUser.id);
        expect(n.type).toBe(NotificationType.QUEST);
      });
    });

    it('should find notifications by priority', async () => {
      const notifications = await repository.findByPriority(testUser.id, NotificationPriority.HIGH);

      expect(notifications.length).toBeGreaterThan(0);
      notifications.forEach(n => {
        expect(n.userId).toBe(testUser.id);
        expect(n.priority).toBe(NotificationPriority.HIGH);
      });
    });
  });

  describe('findUnreadByUser', () => {
    it('should find unread notifications', async () => {
      const notifications = await repository.findUnreadByUser(testUser.id);

      expect(notifications.length).toBeGreaterThan(0);
      notifications.forEach(n => {
        expect(n.userId).toBe(testUser.id);
        expect(n.status).toBe(NotificationStatus.UNREAD);
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await repository.markAsRead(testNotification.id);

      expect(notification).toBeDefined();
      expect(notification?.status).toBe(NotificationStatus.READ);
      expect(notification?.readAt).toBeDefined();
    });

    it('should return null for non-existent id', async () => {
      const notification = await repository.markAsRead('non-existent-id');

      expect(notification).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      await repository.markAllAsRead(testUser.id);

      const unread = await repository.findUnreadByUser(testUser.id);
      expect(unread.length).toBe(0);

      const all = await repository.findByUser(testUser.id);
      all.forEach(n => {
        expect(n.status).toBe(NotificationStatus.READ);
        expect(n.readAt).toBeDefined();
      });
    });
  });

  describe('archive', () => {
    it('should archive notification', async () => {
      const notification = await repository.archive(testNotification.id);

      expect(notification).toBeDefined();
      expect(notification?.status).toBe(NotificationStatus.ARCHIVED);
    });

    it('should return null for non-existent id', async () => {
      const notification = await repository.archive('non-existent-id');

      expect(notification).toBeNull();
    });
  });

  describe('archiveAll', () => {
    it('should archive all read notifications', async () => {
      // First mark some notifications as read
      await repository.markAllAsRead(testUser.id);
      await repository.archiveAll(testUser.id);

      const notifications = await repository.findByUser(testUser.id);
      notifications.forEach(n => {
        expect(n.status).toBe(NotificationStatus.ARCHIVED);
      });
    });
  });

  describe('deleteExpired', () => {
    beforeEach(async () => {
      // Create expired notification
      await repository.create({
        userId: testUser.id,
        title: 'Expired Notification',
        message: 'This notification has expired',
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.LOW,
        status: NotificationStatus.UNREAD,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
    });

    it('should delete expired notifications', async () => {
      await repository.deleteExpired();

      const notifications = await repository.findByUser(testUser.id);
      notifications.forEach(n => {
        expect(n.expiresAt).toBeUndefined();
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      const count = await repository.getUnreadCount(testUser.id);

      expect(count).toBeGreaterThan(0);
    });
  });
}); 