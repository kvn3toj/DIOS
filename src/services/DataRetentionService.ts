import { Redis } from 'ioredis';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import {
  Analytics,
  AnalyticsType,
  AnalyticsCategory,
} from '../models/Analytics';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';

interface RetentionPolicy {
  type: AnalyticsType | 'all';
  duration: number; // in days
  aggregationRules?: {
    interval: 'hour' | 'day' | 'week' | 'month';
    metrics: string[];
    keepRaw: boolean;
  };
  archiveStrategy?: {
    enabled: boolean;
    storageType: 's3' | 'database';
    compression: boolean;
  };
}

export class DataRetentionService {
  private redis: Redis;
  private analyticsRepository: AnalyticsRepository;
  private readonly retentionPolicies: Map<string, RetentionPolicy>;
  private readonly cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.analyticsRepository = new AnalyticsRepository();
    this.retentionPolicies = new Map();
    this.initializeRetentionPolicies();
    this.startCleanupJob();
  }

  private initializeRetentionPolicies(): void {
    // Raw event data retention
    this.registerRetentionPolicy({
      type: 'all',
      duration: 30, // 30 days for raw events
      aggregationRules: {
        interval: 'hour',
        metrics: ['count', 'sum', 'avg'],
        keepRaw: false,
      },
      archiveStrategy: {
        enabled: true,
        storageType: 's3',
        compression: true,
      },
    });

    // User activity data retention
    this.registerRetentionPolicy({
      type: AnalyticsType.USER_ACTION,
      duration: 90, // 90 days for user activity
      aggregationRules: {
        interval: 'day',
        metrics: ['session_count', 'total_duration', 'action_count'],
        keepRaw: true,
      },
    });

    // Achievement analytics retention
    this.registerRetentionPolicy({
      type: AnalyticsType.ACHIEVEMENT,
      duration: 365, // 1 year for achievement data
      aggregationRules: {
        interval: 'week',
        metrics: ['completion_rate', 'time_to_complete', 'attempt_count'],
        keepRaw: false,
      },
    });

    // Performance metrics retention
    this.registerRetentionPolicy({
      type: AnalyticsType.SYSTEM,
      duration: 7, // 7 days for detailed performance data
      aggregationRules: {
        interval: 'hour',
        metrics: ['response_time', 'error_rate', 'resource_usage'],
        keepRaw: true,
      },
    });
  }

  private registerRetentionPolicy(policy: RetentionPolicy): void {
    this.retentionPolicies.set(policy.type, policy);
  }

  private startCleanupJob(): void {
    setInterval(async () => {
      try {
        await this.executeCleanup();
      } catch (error) {
        logger.error('Error in cleanup job:', error);
      }
    }, this.cleanupInterval);
  }

  private async executeCleanup(): Promise<void> {
    const startTime = Date.now();
    let totalCleaned = 0;
    let totalArchived = 0;

    for (const [type, policy] of this.retentionPolicies) {
      try {
        const cutoffDate = new Date(
          Date.now() - policy.duration * 24 * 60 * 60 * 1000
        );

        // Aggregate data before cleanup if needed
        if (policy.aggregationRules) {
          await this.aggregateDataBeforeCleanup(
            type as AnalyticsType,
            cutoffDate,
            policy
          );
        }

        // Archive data if enabled
        if (policy.archiveStrategy?.enabled) {
          const archivedCount = await this.archiveData(
            type as AnalyticsType,
            cutoffDate,
            policy
          );
          totalArchived += archivedCount;
        }

        // Clean up old data
        const cleanedCount = await this.cleanupData(
          type as AnalyticsType,
          cutoffDate
        );
        totalCleaned += cleanedCount;

        // Record metrics
        createCustomMetric('data_retention_cleanup', cleanedCount, {
          type,
          operation: 'cleanup',
        });
        createCustomMetric('data_retention_archive', totalArchived, {
          type,
          operation: 'archive',
        });
      } catch (error) {
        logger.error('Error cleaning up data type:', { type, error });
      }
    }

    logger.info('Cleanup job completed:', {
      duration: Date.now() - startTime,
      totalCleaned,
      totalArchived,
    });
  }

  private async aggregateDataBeforeCleanup(
    type: AnalyticsType,
    cutoffDate: Date,
    policy: RetentionPolicy
  ): Promise<void> {
    if (!policy.aggregationRules) return;

    const interval = policy.aggregationRules.interval;
    const metrics = policy.aggregationRules.metrics;

    const data = await this.analyticsRepository.getAggregatedMetrics({
      groupBy: ['event'],
      timeRange: { start: cutoffDate, end: new Date() },
      metric: metrics[0],
    });

    // Store aggregated data
    for (const aggregation of data) {
      await this.analyticsRepository.create({
        type: AnalyticsType.SYSTEM,
        category: AnalyticsCategory.PERFORMANCE,
        event: `aggregated_${type}_${interval}`,
        data: {
          metrics: aggregation,
          interval,
          originalType: type,
        },
        timestamp: new Date(),
      });
    }
  }

  private async archiveData(
    type: AnalyticsType,
    cutoffDate: Date,
    policy: RetentionPolicy
  ): Promise<number> {
    if (!policy.archiveStrategy?.enabled) return 0;

    const data = await this.analyticsRepository.find({
      where: {
        type,
        timestamp: { $lt: cutoffDate },
      },
    });

    if (data.length === 0) return 0;

    if (policy.archiveStrategy.storageType === 's3') {
      await this.archiveToS3(data, type, policy);
    } else {
      await this.archiveToDatabase(data, type, policy);
    }

    return data.length;
  }

  private async archiveToS3(
    data: Analytics[],
    type: AnalyticsType,
    policy: RetentionPolicy
  ): Promise<void> {
    // Implementation would depend on AWS SDK configuration
    // This is a placeholder for the actual S3 archival logic
    logger.info('Archiving data to S3:', {
      type,
      count: data.length,
      compression: policy.archiveStrategy?.compression,
    });
  }

  private async archiveToDatabase(
    data: Analytics[],
    type: AnalyticsType,
    policy: RetentionPolicy
  ): Promise<void> {
    // Archive to a separate database table or collection
    // This is a placeholder for the actual database archival logic
    logger.info('Archiving data to database:', {
      type,
      count: data.length,
    });
  }

  private async cleanupData(
    type: AnalyticsType | 'all',
    cutoffDate: Date
  ): Promise<number> {
    const where =
      type === 'all'
        ? { timestamp: { $lt: cutoffDate } }
        : { type, timestamp: { $lt: cutoffDate } };

    const result = await this.analyticsRepository.delete(where);
    return result.affected || 0;
  }

  async getRetentionStatus(): Promise<{
    policies: Record<string, RetentionPolicy>;
    metrics: {
      totalRecords: number;
      oldestRecord: Date;
      newestRecord: Date;
      sizeByType: Record<string, number>;
    };
  }> {
    const [totalRecords, oldestRecord, newestRecord, typeStats] =
      await Promise.all([
        this.analyticsRepository.count(),
        this.analyticsRepository.findOne({ order: { timestamp: 'ASC' } }),
        this.analyticsRepository.findOne({ order: { timestamp: 'DESC' } }),
        this.getAnalyticsSizeByType(),
      ]);

    return {
      policies: Object.fromEntries(this.retentionPolicies),
      metrics: {
        totalRecords,
        oldestRecord: oldestRecord?.timestamp || new Date(),
        newestRecord: newestRecord?.timestamp || new Date(),
        sizeByType: typeStats,
      },
    };
  }

  private async getAnalyticsSizeByType(): Promise<Record<string, number>> {
    const stats = await this.analyticsRepository.getMetricsSummary({
      start: new Date(0),
      end: new Date(),
    });

    return Object.entries(stats.eventTypes).reduce(
      (acc, [type, count]) => {
        acc[type] = count;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  async cleanup(): Promise<void> {
    try {
      await this.executeCleanup();
    } catch (error) {
      logger.error('Error in manual cleanup:', error);
      throw error;
    }
  }
}
