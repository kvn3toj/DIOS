import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { RewardService } from '../services/RewardService';
import { RewardType } from '../models/Reward';
import { logger } from '../utils/logger';

export class RewardController extends BaseController {
  private rewardService: RewardService;

  constructor() {
    super();
    this.rewardService = new RewardService();
  }

  createReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, [
        'userId',
        'name',
        'type',
        'value'
      ]);

      this.validateEnumParam(req.body.type, RewardType, 'type');
      if (req.body.expiresAt) {
        this.validateDateParam(req.body.expiresAt);
      }

      const reward = await this.rewardService.createReward(req.body);
      return this.handleSuccess(res, reward, 'Reward created successfully');
    });
  };

  getReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const reward = await this.rewardService.getReward(req.params.id);
      return this.handleSuccess(res, reward);
    });
  };

  getUserRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);

      const options: any = {};
      if (req.query.type) {
        this.validateEnumParam(req.query.type as string, RewardType, 'type');
        options.type = req.query.type;
      }

      const rewards = await this.rewardService.getUserRewards(req.params.userId, options);
      return this.handleSuccess(res, rewards);
    });
  };

  getAvailableRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const rewards = await this.rewardService.getAvailableRewards(req.params.userId);
      return this.handleSuccess(res, rewards);
    });
  };

  claimReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.id);
      const reward = await this.rewardService.claimReward(req.params.id);
      return this.handleSuccess(res, reward, 'Reward claimed successfully');
    });
  };

  batchCreateRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, ['rewards']);
      if (!Array.isArray(req.body.rewards)) {
        throw new Error('Rewards must be an array');
      }

      // Validate each reward in the array
      req.body.rewards.forEach((reward: any, index: number) => {
        this.validateRequiredParams(reward, [
          'userId',
          'name',
          'type',
          'value'
        ]);
        this.validateEnumParam(reward.type, RewardType, `rewards[${index}].type`);
        if (reward.expiresAt) {
          this.validateDateParam(reward.expiresAt);
        }
      });

      const rewards = await this.rewardService.batchCreateRewards(req.body.rewards);
      return this.handleSuccess(res, rewards, 'Rewards created successfully');
    });
  };

  cleanupExpiredRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      await this.rewardService.cleanupExpiredRewards();
      return this.handleSuccess(res, null, 'Expired rewards cleaned up');
    });
  };

  getRewardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const stats = await this.rewardService.getRewardStats(req.params.userId);
      return this.handleSuccess(res, stats);
    });
  };
} 