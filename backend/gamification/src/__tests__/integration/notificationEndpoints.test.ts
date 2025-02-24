import request from 'supertest';
import { Express } from 'express';
import { AppDataSource } from '../../config/database';
import { createApp } from '../../app';
import { User } from '../../models/User';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../models/Notification';
import { generateJwtToken } from '../../utils/auth';
import { eventBus } from '../../config/eventBus';
import { logger } from '../../utils/logger';

describe('Notification API Endpoints', () => {
  let app: Express;
  let testUser: User;
  let adminUser: User;
  let testNotification: Notification;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Initialize the application
    app = await createApp();

    // Initialize test database connection
    await AppDataSource.initialize();

    // Mock event bus
    jest.spyOn(eventBus, 'publish').mockImplementation(() => Promise.resolve());
  });

  beforeEach(async () => {
    // Clear database before each test
    await AppDataSource.synchronize(true);

    // Create test users
    testUser = await AppDataSource.getRepository(User).save({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: 'user',
      level: 1,
      experience: 0,
      points: 0
    });

    adminUser = await AppDataSource.getRepository(User).save({
      username: 'admin',
      email: 'admin@example.com',
      password: 'hashedPassword123',
      role: 'admin',
      level: 10,
      experience: 1000,
      points: 500
    });

    // Create test notification
    testNotification = await AppDataSource.getRepository(Notification).save({
      userId: testUser.id,
      title: 'Test Notification',
      message: 'Test Message',
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.MEDIUM,
      status: NotificationStatus.UNREAD,
      data: { test: 'data' }
    });

    // Generate auth tokens
    authToken = generateJwtToken(testUser);
    adminToken = generateJwtToken(adminUser);
  });

  afterAll(async () => {
    // Close database connection
    await AppDataSource.destroy();
  });

  describe('POST /api/v1/notifications', () => {
    it('should create notification successfully', async () => {
      const notificationData = {
        userId: testUser.id,
        title: 'New Notification',
        message: 'Test Message',
        type: NotificationType.ACHIEVEMENT,
        priority: NotificationPriority.HIGH,
        data: { achievementId: 'test-id' },
        isActionable: true,
        actionUrl: '/achievements/test-id'
      };

      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        status: NotificationStatus.UNREAD
      }));

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'notification.created',
        expect.objectContaining({
          notificationId: response.body.data.id,
          userId: notificationData.userId,
          type: notificationData.type
        })
      );
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/notifications/:id', () => {
    it('should get notification successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/${testNotification.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expect.objectContaining({
        id: testNotification.id,
        title: testNotification.title,
        message: testNotification.message,
        type: testNotification.type,
        status: testNotification.status
      }));
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Notification not found');
    });
  });

  describe('GET /api/v1/notifications/user/:userId', () => {
    beforeEach(async () => {
      // Create additional test notifications
      await AppDataSource.getRepository(Notification).save([
        {
          userId: testUser.id,
          title: 'Achievement Notification',
          message: 'Test Message',
          type: NotificationType.ACHIEVEMENT,
          priority: NotificationPriority.HIGH,
          status: NotificationStatus.UNREAD
        },
        {
          userId: testUser.id,
          title: 'Quest Notification',
          message: 'Test Message',
          type: NotificationType.QUEST,
          priority: NotificationPriority.MEDIUM,
          status: NotificationStatus.READ,
          readAt: new Date()
        }
      ]);
    });

    it('should get user notifications successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/user/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/user/${testUser.id}`)
        .query({ type: NotificationType.ACHIEVEMENT })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe(NotificationType.ACHIEVEMENT);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/user/${testUser.id}`)
        .query({ status: NotificationStatus.UNREAD })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(n => n.status === NotificationStatus.UNREAD)).toBe(true);
    });
  });

  describe('GET /api/v1/notifications/user/:userId/unread', () => {
    it('should get unread notifications', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/user/${testUser.id}/unread`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(NotificationStatus.UNREAD);
    });
  });

  describe('POST /api/v1/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const response = await request(app)
        .post(`/api/v1/notifications/${testNotification.id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(NotificationStatus.READ);
      expect(response.body.data.readAt).toBeDefined();

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'notification.read',
        expect.objectContaining({
          notificationId: testNotification.id,
          userId: testUser.id
        })
      );
    });
  });

  describe('POST /api/v1/notifications/user/:userId/read-all', () => {
    it('should mark all notifications as read', async () => {
      const response = await request(app)
        .post(`/api/v1/notifications/user/${testUser.id}/read-all`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify all notifications are read
      const notifications = await AppDataSource.getRepository(Notification).find({
        where: { userId: testUser.id }
      });
      expect(notifications.every(n => n.status === NotificationStatus.READ)).toBe(true);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'notification.all_read',
        expect.objectContaining({
          userId: testUser.id
        })
      );
    });
  });

  describe('POST /api/v1/notifications/:id/archive', () => {
    it('should archive notification', async () => {
      const response = await request(app)
        .post(`/api/v1/notifications/${testNotification.id}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(NotificationStatus.ARCHIVED);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'notification.archived',
        expect.objectContaining({
          notificationId: testNotification.id,
          userId: testUser.id
        })
      );
    });
  });

  describe('POST /api/v1/notifications/user/:userId/archive-all', () => {
    beforeEach(async () => {
      // Mark test notification as read
      await AppDataSource.getRepository(Notification).update(
        testNotification.id,
        { status: NotificationStatus.READ, readAt: new Date() }
      );
    });

    it('should archive all read notifications', async () => {
      const response = await request(app)
        .post(`/api/v1/notifications/user/${testUser.id}/archive-all`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify read notifications are archived
      const notifications = await AppDataSource.getRepository(Notification).find({
        where: { userId: testUser.id, status: NotificationStatus.READ }
      });
      expect(notifications).toHaveLength(0);

      // Verify event was published
      expect(eventBus.publish).toHaveBeenCalledWith(
        'notification.all_archived',
        expect.objectContaining({
          userId: testUser.id
        })
      );
    });
  });

  describe('POST /api/v1/notifications/cleanup', () => {
    beforeEach(async () => {
      // Create expired notification
      await AppDataSource.getRepository(Notification).save({
        userId: testUser.id,
        title: 'Expired Notification',
        message: 'Test Message',
        type: NotificationType.SYSTEM,
        priority: NotificationPriority.LOW,
        status: NotificationStatus.UNREAD,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
    });

    it('should delete expired notifications', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/cleanup')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify expired notifications are deleted
      const notifications = await AppDataSource.getRepository(Notification).find({
        where: { userId: testUser.id }
      });
      expect(notifications.every(n => !n.expiresAt || n.expiresAt > new Date())).toBe(true);
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/cleanup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/notifications/user/:userId/count', () => {
    it('should get unread notification count', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/user/${testUser.id}/count`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ count: 1 });
    });
  });
}); 