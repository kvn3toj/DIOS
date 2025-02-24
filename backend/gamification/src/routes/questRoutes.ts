import { Router } from 'express';
import { QuestController } from '../controllers/QuestController';

const router = Router();
const controller = new QuestController();

// Quest CRUD routes
router.post('/', controller.createQuest);
router.get('/:id', controller.getQuest);
router.put('/:id', controller.updateQuest);

// Quest listing routes
router.get('/type/:type', controller.getQuestsByType);
router.get('/difficulty/:difficulty', controller.getQuestsByDifficulty);
router.get('/user/:userId/available', controller.getAvailableQuests);

// Quest progress routes
router.post('/user/:userId/quest/:questId/start', controller.startQuest);
router.post('/user/:userId/quest/:questId/progress', controller.updateObjectiveProgress);
router.get('/user/:userId/quest/:questId/progress', controller.getQuestProgress);

// Quest stats and search
router.get('/stats', controller.getQuestStats);
router.get('/search', controller.searchQuests);

export default router; 