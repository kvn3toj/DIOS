import { Redis } from 'ioredis';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { AnalyticsType, AnalyticsCategory } from '../models/Analytics';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';

interface AggregationPipeline {
  name: string;
  type: 'time-series' | 'group-by' | 'funnel' | 'cohort';
  config: {
    timeWindow?: string;
    groupBy?: string[];
    metrics: string[];
    filters?: Record<string, any>;
    having?: Record<string, any>;
    sort?: Record<string, 'asc' | 'desc'>;
    limit?: number;
  };
}

interface AggregationResult {
  timestamp?: Date;
  group?: Record<string, any>;
  metrics: Record<string, number>;
  count: number;
}

export class AggregationPipelineService {
  private redis: Redis;
  private analyticsRepository: AnalyticsRepository;
  private readonly pipelines: Map<string, AggregationPipeline>;
  private readonly aggregationInterval = 60000; // 1 minute

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.analyticsRepository = new AnalyticsRepository();
    this.pipelines = new Map();
    this.initializePipelines();
    this.startAggregation();
  }

  private initializePipelines(): void {
    // User engagement pipeline
    this.registerPipeline({
      name: 'user_engagement',
      type: 'time-series',
      config: {
        timeWindow: '1h',
        metrics: ['session_duration', 'action_count', 'feature_usage'],
        groupBy: ['user_id'],
        sort: { action_count: 'desc' },
        limit: 100,
      },
    });

    // Achievement completion pipeline
    this.registerPipeline({
      name: 'achievement_completion',
      type: 'funnel',
      config: {
        metrics: ['started_count', 'progress_updates', 'completed_count'],
        groupBy: ['achievement_id', 'difficulty'],
        filters: { type: AnalyticsType.ACHIEVEMENT },
      },
    });

    // User retention pipeline
    this.registerPipeline({
      name: 'user_retention',
      type: 'cohort',
      config: {
        timeWindow: '7d',
        metrics: ['active_users', 'returning_users'],
        groupBy: ['registration_cohort'],
        having: { active_users: { $gt: 10 } },
      },
    });
  }

  private registerPipeline(pipeline: AggregationPipeline): void {
    this.pipelines.set(pipeline.name, pipeline);
  }

  private startAggregation(): void {
    setInterval(async () => {
      try {
        for (const pipeline of this.pipelines.values()) {
          await this.executePipeline(pipeline);
        }
      } catch (error) {
        logger.error('Error in aggregation interval:', error);
      }
    }, this.aggregationInterval);
  }

  private async executePipeline(pipeline: AggregationPipeline): Promise<void> {
    try {
      const startTime = Date.now();
      const results = await this.processPipeline(pipeline);

      // Store results in Redis with expiration
      const key = `aggregation:${pipeline.name}:${startTime}`;
      await this.redis.setex(key, 86400, JSON.stringify(results)); // 24h retention

      // Record metrics
      createCustomMetric(
        'aggregation_pipeline_execution',
        Date.now() - startTime,
        {
          pipeline: pipeline.name,
          type: pipeline.type,
        }
      );

      logger.info('Pipeline executed successfully:', {
        pipeline: pipeline.name,
        resultsCount: results.length,
      });
    } catch (error) {
      logger.error('Pipeline execution failed:', {
        pipeline: pipeline.name,
        error,
      });
      throw error;
    }
  }

  private async processPipeline(
    pipeline: AggregationPipeline
  ): Promise<AggregationResult[]> {
    switch (pipeline.type) {
      case 'time-series':
        return this.processTimeSeriesPipeline(pipeline);
      case 'group-by':
        return this.processGroupByPipeline(pipeline);
      case 'funnel':
        return this.processFunnelPipeline(pipeline);
      case 'cohort':
        return this.processCohortPipeline(pipeline);
      default:
        throw new Error(`Unsupported pipeline type: ${pipeline.type}`);
    }
  }

  private async processTimeSeriesPipeline(
    pipeline: AggregationPipeline
  ): Promise<AggregationResult[]> {
    const timeWindow = this.parseTimeWindow(pipeline.config.timeWindow);
    const analytics = await this.analyticsRepository.getAggregatedMetrics({
      groupBy: pipeline.config.groupBy || [],
      timeRange: timeWindow,
      metric: pipeline.config.metrics[0],
    });

    return analytics.map((a) => ({
      timestamp: a.timestamp,
      group: this.extractGroups(a, pipeline.config.groupBy),
      metrics: this.calculateMetrics(a, pipeline.config.metrics),
      count: a.count,
    }));
  }

  private async processGroupByPipeline(
    pipeline: AggregationPipeline
  ): Promise<AggregationResult[]> {
    const analytics = await this.analyticsRepository.find({
      where: pipeline.config.filters,
      order: pipeline.config.sort,
      take: pipeline.config.limit,
    });

    return this.groupAnalytics(analytics, pipeline.config);
  }

  private async processFunnelPipeline(
    pipeline: AggregationPipeline
  ): Promise<AggregationResult[]> {
    const results: AggregationResult[] = [];
    let previousCount = 0;

    for (const metric of pipeline.config.metrics) {
      const count = await this.analyticsRepository.count({
        where: {
          ...pipeline.config.filters,
          event: metric,
        },
      });

      results.push({
        metrics: {
          [metric]: count,
          conversion_rate: previousCount ? count / previousCount : 1,
        },
        count,
      });

      previousCount = count;
    }

    return results;
  }

  private async processCohortPipeline(
    pipeline: AggregationPipeline
  ): Promise<AggregationResult[]> {
    const cohorts = await this.analyticsRepository.getMetricsSummary({
      start: new Date(
        Date.now() - this.parseTimeWindow(pipeline.config.timeWindow).duration
      ),
      end: new Date(),
    });

    return Object.entries(cohorts.categories).map(([cohort, count]) => ({
      group: { cohort },
      metrics: { users: count },
      count,
    }));
  }

  private parseTimeWindow(window?: string): {
    start: Date;
    end: Date;
    duration: number;
  } {
    const now = Date.now();
    const duration = window ? this.parseDuration(window) : 24 * 60 * 60 * 1000; // Default 24h

    return {
      start: new Date(now - duration),
      end: new Date(now),
      duration,
    };
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));

    switch (unit) {
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'w':
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid duration unit: ${unit}`);
    }
  }

  private extractGroups(
    analytics: any,
    groupBy?: string[]
  ): Record<string, any> {
    if (!groupBy) return {};
    return groupBy.reduce((acc, key) => {
      acc[key] = analytics[key];
      return acc;
    }, {});
  }

  private calculateMetrics(
    analytics: any,
    metrics: string[]
  ): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      acc[metric] = analytics[metric] || 0;
      return acc;
    }, {});
  }

  private groupAnalytics(
    analytics: any[],
    config: AggregationPipeline['config']
  ): AggregationResult[] {
    const groups = new Map<string, AggregationResult>();

    for (const analytic of analytics) {
      const groupKey = this.getGroupKey(analytic, config.groupBy);
      const existing = groups.get(groupKey) || {
        group: this.extractGroups(analytic, config.groupBy),
        metrics: {},
        count: 0,
      };

      existing.metrics = this.mergeMetrics(
        existing.metrics,
        analytic,
        config.metrics
      );
      existing.count++;
      groups.set(groupKey, existing);
    }

    return Array.from(groups.values());
  }

  private getGroupKey(analytic: any, groupBy?: string[]): string {
    if (!groupBy) return 'default';
    return groupBy.map((key) => analytic[key]).join(':');
  }

  private mergeMetrics(
    existing: Record<string, number>,
    analytic: any,
    metrics: string[]
  ): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      acc[metric] = (acc[metric] || 0) + (analytic[metric] || 0);
      return acc;
    }, existing);
  }

  async getPipelineResults(
    name: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<AggregationResult[]> {
    try {
      const pipeline = this.pipelines.get(name);
      if (!pipeline) {
        throw new Error(`Pipeline not found: ${name}`);
      }

      const pattern = `aggregation:${name}:*`;
      const keys = await this.redis.keys(pattern);
      const results = await Promise.all(
        keys.map(async (key) => {
          const value = await this.redis.get(key);
          return value ? JSON.parse(value) : null;
        })
      );

      return results.filter(Boolean);
    } catch (error) {
      logger.error('Error getting pipeline results:', { name, error });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      const pattern = 'aggregation:*';
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.error('Error cleaning up aggregations:', error);
      throw error;
    }
  }
}
