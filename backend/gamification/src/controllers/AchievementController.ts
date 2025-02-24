import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { AchievementService } from '../services/AchievementService';
import { AchievementType, AchievementRarity } from '../models/Achievement';
import { logger } from '../utils/logger';

export class AchievementController extends BaseController {
  private achievementService: AchievementService;

  constructor() {
    super();
    this.achievementService = new AchievementService();
  }

  createAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, [
        'name',
        'description',
        'type',
        'rarity',
        'points',
        'criteria'
      ]);

      this.validateEnumParam(req.body.type, AchievementType, 'type');
      this.validateEnumParam(req.body.rarity, AchievementRarity, 'rarity');

      const achievement = await this.achievementService.createAchievement(req.body);
      return this.handleSuccess(res, achievement, 'Achievement created successfully');
    });
  };

  getAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const achievement = await this.achievementService.getAchievement(req.params.id);
      return this.handleSuccess(res, achievement);
    });
  };

  updateAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      
      if (req.body.type) {
        this.validateEnumParam(req.body.type, AchievementType, 'type');
      }
      if (req.body.rarity) {
        this.validateEnumParam(req.body.rarity, AchievementRarity, 'rarity');
      }

      const achievement = await this.achievementService.updateAchievement(req.params.id, req.body);
      return this.handleSuccess(res, achievement, 'Achievement updated successfully');
    });
  };

  getAvailableAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const achievements = await this.achievementService.getAvailableAchievements(req.params.userId);
      return this.handleSuccess(res, achievements);
    });
  };

  updateProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      this.validateIdParam(req.params.achievementId);
      this.validateNumberParam(req.body.progress, 'progress');

      const progress = await this.achievementService.updateProgress(
        req.params.userId,
        req.params.achievementId,
        req.body.progress,
        req.body.metadata
      );
      return this.handleSuccess(res, progress, 'Progress updated successfully');
    });
  };

  getAchievementStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const stats = await this.achievementService.getAchievementStats();
      return this.handleSuccess(res, stats);
    });
  };

  getAchievementsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateEnumParam(req.params.type, AchievementType, 'type');
      const achievements = await this.achievementService.getAchievementsByType(req.params.type as AchievementType);
      return this.handleSuccess(res, achievements);
    });
  };

  getAchievementsByRarity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateEnumParam(req.params.rarity, AchievementRarity, 'rarity');
      const achievements = await this.achievementService.getAchievementsByRarity(req.params.rarity as AchievementRarity);
      return this.handleSuccess(res, achievements);
    });
  };

  getAchievementProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      this.validateIdParam(req.params.achievementId);
      const progress = await this.achievementService.getAchievementProgress(req.params.userId, req.params.achievementId);
      return this.handleSuccess(res, progress);
    });
  };

  searchAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const { query } = req.query;
      const { page, limit } = this.getPaginationParams(req);
      const achievements = await this.achievementService.searchAchievements(query as string, { page, limit });
      return this.handleSuccess(res, achievements);
    });
  };
} 