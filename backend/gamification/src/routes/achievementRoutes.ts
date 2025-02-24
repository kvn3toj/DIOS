import { Router } from 'express';
import { AchievementController } from '../controllers/AchievementController';

const router = Router();
const controller = new AchievementController();

// Achievement CRUD routes
router.post('/', controller.createAchievement);
router.get('/:id', controller.getAchievement);
router.put('/:id', controller.updateAchievement);

// Achievement listing routes
router.get('/type/:type', controller.getAchievementsByType);
router.get('/rarity/:rarity', controller.getAchievementsByRarity);
router.get('/user/:userId/available', controller.getAvailableAchievements);

// Achievement progress routes
router.post('/user/:userId/achievement/:achievementId/progress', controller.updateProgress);
router.get('/user/:userId/achievement/:achievementId/progress', controller.getAchievementProgress);

// Achievement stats and search
router.get('/stats', controller.getAchievementStats);
router.get('/search', controller.searchAchievements);

export default router; 