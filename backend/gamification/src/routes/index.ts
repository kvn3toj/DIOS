import { Router } from 'express';
import userRoutes from './userRoutes';
import achievementRoutes from './achievementRoutes';
import questRoutes from './questRoutes';
import notificationRoutes from './notificationRoutes';
import rewardRoutes from './rewardRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = Router();

// Mount routes
router.use('/users', userRoutes);
router.use('/achievements', achievementRoutes);
router.use('/quests', questRoutes);
router.use('/notifications', notificationRoutes);
router.use('/rewards', rewardRoutes);
router.use('/analytics', analyticsRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router; 