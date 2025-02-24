import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnalyticsType, AnalyticsCategory } from '../models/Analytics';
import { logger } from '../utils/logger';

export class AnalyticsController extends BaseController {
  private analyticsService: AnalyticsService;

  constructor() {
    super();
    this.analyticsService = new AnalyticsService();
  }

  trackEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.body, [
        'userId',
        'type',
        'category',
        'event'
      ]);

      this.validateEnumParam(req.body.type, AnalyticsType, 'type');
      this.validateEnumParam(req.body.category, AnalyticsCategory, 'category');

      const analytics = await this.analyticsService.trackEvent(req.body);
      return this.handleSuccess(res, analytics, 'Event tracked successfully');
    });
  };

  getUserAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);

      let timeRange;
      if (req.query.start || req.query.end) {
        timeRange = this.getTimeRangeParams(req);
      }

      const analytics = await this.analyticsService.getUserAnalytics(req.params.userId, timeRange);
      return this.handleSuccess(res, analytics);
    });
  };

  getEventAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.params, ['event']);

      let timeRange;
      if (req.query.start || req.query.end) {
        timeRange = this.getTimeRangeParams(req);
      }

      const analytics = await this.analyticsService.getEventAnalytics(req.params.event, timeRange);
      return this.handleSuccess(res, analytics);
    });
  };

  getMetricsSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const timeRange = this.getTimeRangeParams(req);
      const summary = await this.analyticsService.getMetricsSummary(timeRange);
      return this.handleSuccess(res, summary);
    });
  };

  getAggregatedMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateRequiredParams(req.query, ['groupBy', 'metric']);
      this.validateEnumParam(
        req.query.groupBy as string,
        ['hour', 'day', 'week', 'month'],
        'groupBy'
      );

      const timeRange = this.getTimeRangeParams(req);
      const metrics = await this.analyticsService.getAggregatedMetrics({
        groupBy: req.query.groupBy as 'hour' | 'day' | 'week' | 'month',
        timeRange,
        metric: req.query.metric as string
      });
      return this.handleSuccess(res, metrics);
    });
  };

  getUserEngagementMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      this.validateIdParam(req.params.userId);
      const metrics = await this.analyticsService.getUserEngagementMetrics(req.params.userId);
      return this.handleSuccess(res, metrics);
    });
  };

  getSystemMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.execute(req, res, next, async () => {
      const timeRange = this.getTimeRangeParams(req);
      const metrics = await this.analyticsService.getSystemMetrics(timeRange);
      return this.handleSuccess(res, metrics);
    });
  };
} 