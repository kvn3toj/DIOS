import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const controller = new UserController();

// User profile routes
router.get('/:id', controller.getUser);
router.put('/:id', controller.updateUser);
router.get('/:id/progress', controller.getUserProgress);
router.get('/:id/stats', controller.getUserStats);

// Experience and points routes
router.post('/:id/experience', controller.addExperience);
router.post('/:id/points', controller.addPoints);
router.put('/:id/level', controller.updateLevel);
router.put('/:id/stats', controller.updateStats);

// Achievement and quest routes
router.get('/:id/achievements', controller.getUserAchievements);
router.get('/:id/quests', controller.getUserQuests);
router.get('/:id/rewards', controller.getUserRewards);

// Search route
router.get('/search', controller.searchUsers);

export default router; 