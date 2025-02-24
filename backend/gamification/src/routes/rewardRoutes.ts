import { Router } from 'express';
import { RewardController } from '../controllers/RewardController';

const router = Router();
const controller = new RewardController();

// Reward CRUD routes
router.post('/', controller.createReward);
router.get('/:id', controller.getReward);

// User reward routes
router.get('/user/:userId', controller.getUserRewards);
router.get('/user/:userId/available', controller.getAvailableRewards);
router.get('/user/:userId/stats', controller.getRewardStats);

// Reward management
router.post('/:id/claim', controller.claimReward);
router.post('/batch', controller.batchCreateRewards);
router.post('/cleanup', controller.cleanupExpiredRewards);

export default router; 