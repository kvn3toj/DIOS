import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const user = await this.userService.getUser(req.params.id);
      return this.handleSuccess(res, user);
    });
  };

  getUserProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const progress = await this.userService.getUserProgress(req.params.id);
      return this.handleSuccess(res, progress);
    });
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const user = await this.userService.updateUser(req.params.id, req.body);
      return this.handleSuccess(res, user, 'User updated successfully');
    });
  };

  addExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      this.validateNumberParam(req.body.amount, 'amount');
      const user = await this.userService.addExperience(req.params.id, req.body.amount);
      return this.handleSuccess(res, user, 'Experience added successfully');
    });
  };

  addPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      this.validateNumberParam(req.body.amount, 'amount');
      const user = await this.userService.addPoints(req.params.id, req.body.amount);
      return this.handleSuccess(res, user, 'Points added successfully');
    });
  };

  updateLevel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      this.validateNumberParam(req.body.level, 'level');
      const user = await this.userService.updateLevel(req.params.id, req.body.level);
      return this.handleSuccess(res, user, 'Level updated successfully');
    });
  };

  updateStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      this.validateRequiredParams(req.body, ['stats']);
      const user = await this.userService.updateUserStats(req.params.id, req.body.stats);
      return this.handleSuccess(res, user, 'Stats updated successfully');
    });
  };

  getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const stats = await this.userService.getUserStats(req.params.id);
      return this.handleSuccess(res, stats);
    });
  };

  getUserAchievements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const achievements = await this.userService.getUserAchievements(req.params.id);
      return this.handleSuccess(res, achievements);
    });
  };

  getUserQuests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const quests = await this.userService.getUserQuests(req.params.id);
      return this.handleSuccess(res, quests);
    });
  };

  getUserRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const rewards = await this.userService.getUserRewards(req.params.id);
      return this.handleSuccess(res, rewards);
    });
  };

  searchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const { query } = req.query;
      const { page, limit } = this.getPaginationParams(req);
      const users = await this.userService.searchUsers(query as string, { page, limit });
      return this.handleSuccess(res, users);
    });
  };
} 