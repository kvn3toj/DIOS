import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();
const controller = new NotificationController();

// Notification CRUD routes
router.post('/', controller.createNotification);
router.get('/:id', controller.getNotification);

// User notification routes
router.get('/user/:userId', controller.getUserNotifications);
router.get('/user/:userId/unread', controller.getUnreadNotifications);
router.get('/user/:userId/count', controller.getUnreadCount);

// Notification status management
router.post('/:id/read', controller.markAsRead);
router.post('/user/:userId/read-all', controller.markAllAsRead);
router.post('/:id/archive', controller.archiveNotification);
router.post('/user/:userId/archive-all', controller.archiveAllRead);

// System notification management
router.post('/cleanup', controller.deleteExpiredNotifications);

// Specialized notification creation
router.post('/achievement', controller.createAchievementNotification);
router.post('/quest', controller.createQuestNotification);
router.post('/level-up', controller.createLevelUpNotification);
router.post('/reward', controller.createRewardNotification);

export default router; 