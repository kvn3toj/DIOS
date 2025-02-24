import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { QuestService } from '../services/QuestService';
import { QuestType, QuestDifficulty } from '../models/Quest';
import { logger } from '../utils/logger';

export class QuestController extends BaseController {
  private questService: QuestService;

  constructor() {
    super();
    this.questService = new QuestService();
  }

  createQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, [
        'name',
        'description',
        'type',
        'difficulty',
        'experienceReward',
        'pointsReward',
        'objectives'
      ]);

      this.validateEnumParam(req.body.type, QuestType, 'type');
      this.validateEnumParam(req.body.difficulty, QuestDifficulty, 'difficulty');
      this.validateNumberParam(req.body.experienceReward, 'experienceReward');
      this.validateNumberParam(req.body.pointsReward, 'pointsReward');

      if (req.body.startDate) {
        this.validateDateParam(req.body.startDate);
      }
      if (req.body.endDate) {
        this.validateDateParam(req.body.endDate);
      }

      const quest = await this.questService.createQuest(req.body);
      return this.handleSuccess(res, quest, 'Quest created successfully');
    });
  };

  getQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const quest = await this.questService.getQuest(req.params.id);
      return this.handleSuccess(res, quest);
    });
  };

  updateQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);

      if (req.body.type) {
        this.validateEnumParam(req.body.type, QuestType, 'type');
      }
      if (req.body.difficulty) {
        this.validateEnumParam(req.body.difficulty, QuestDifficulty, 'difficulty');
      }
      if (req.body.startDate) {
        this.validateDateParam(req.body.startDate);
      }
      if (req.body.endDate) {
        this.validateDateParam(req.body.endDate);
      }

      const quest = await this.questService.updateQuest(req.params.id, req.body);
      return this.handleSuccess(res, quest, 'Quest updated successfully');
    });
  };

  getAvailableQuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const quests = await this.questService.getAvailableQuests(req.params.userId);
      return this.handleSuccess(res, quests);
    });
  };

  startQuest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      this.validateIdParam(req.params.questId);

      const progress = await this.questService.startQuest(req.params.userId, req.params.questId);
      return this.handleSuccess(res, progress, 'Quest started successfully');
    });
  };

  updateObjectiveProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      this.validateIdParam(req.params.questId);
      this.validateNumberParam(req.body.objectiveIndex, 'objectiveIndex');
      this.validateNumberParam(req.body.value, 'value');

      const progress = await this.questService.updateObjectiveProgress(
        req.params.userId,
        req.params.questId,
        parseInt(req.body.objectiveIndex),
        req.body.value
      );
      return this.handleSuccess(res, progress, 'Objective progress updated successfully');
    });
  };

  getQuestStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const stats = await this.questService.getQuestStats();
      return this.handleSuccess(res, stats);
    });
  };

  getQuestsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateEnumParam(req.params.type, QuestType, 'type');
      const quests = await this.questService.getQuestsByType(req.params.type as QuestType);
      return this.handleSuccess(res, quests);
    });
  };

  getQuestsByDifficulty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateEnumParam(req.params.difficulty, QuestDifficulty, 'difficulty');
      const quests = await this.questService.getQuestsByDifficulty(req.params.difficulty as QuestDifficulty);
      return this.handleSuccess(res, quests);
    });
  };

  getQuestProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      this.validateIdParam(req.params.questId);
      const progress = await this.questService.getQuestProgress(req.params.userId, req.params.questId);
      return this.handleSuccess(res, progress);
    });
  };

  searchQuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const { query } = req.query;
      const { page, limit } = this.getPaginationParams(req);
      const quests = await this.questService.searchQuests(query as string, { page, limit });
      return this.handleSuccess(res, quests);
    });
  };
} 