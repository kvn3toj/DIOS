import { Analytics, AnalyticsType, AnalyticsCategory } from '../models/Analytics';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { UserService } from './UserService';
import { publishEvent } from '../config/rabbitmq';
import { redisSet, redisGet } from '../config/redis';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';

export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;
  private userService: UserService;
  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
    this.userService = new UserService();
  }

  async trackEvent(data: {
    userId: string;
    type: AnalyticsType;
    category: AnalyticsCategory;
    event: string;
    data?: {
      value?: number;
      metadata?: Record<string, any>;
      context?: Record<string, any>;
    };
    metrics?: {
      duration?: number;
      count?: number;
      value?: number;
      custom?: Record<string, number>;
    };
    source?: string;
    platform?: string;
    version?: string;
    session?: {
      id: string;
      startTime: Date;
      duration?: number;
    };
  }): Promise<Analytics> {
    try {
      // Verify user exists
      const user = await this.userService.getUser(data.userId);
      if (!user) {
        throw new APIError(404, 'User not found');
      }

      const analytics = await this.analyticsRepository.create({
        ...data,
        timestamp: new Date()
      });

      await publishEvent('analytics.event_tracked', {
        analyticsId: analytics.id,
        userId: analytics.userId,
        type: analytics.type,
        category: analytics.category,
        event: analytics.event,
        timestamp: analytics.timestamp
      });

      // Invalidate relevant caches
      await this.invalidateMetricsCache(data.userId);

      return analytics;
    } catch (error) {
      logger.error('Error in trackEvent:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId: string, timeRange?: { start: Date; end: Date }): Promise<Analytics[]> {
    try {
      if (timeRange) {
        return await this.analyticsRepository.find({
          where: {
            userId,
            timestamp: {
              $gte: timeRange.start,
              $lte: timeRange.end
            }
          }
        });
      }
      return await this.analyticsRepository.findByUser(userId);
    } catch (error) {
      logger.error('Error in getUserAnalytics:', error);
      throw error;
    }
  }

  async getEventAnalytics(event: string, timeRange?: { start: Date; end: Date }): Promise<Analytics[]> {
    try {
      if (timeRange) {
        return await this.analyticsRepository.find({
          where: {
            event,
            timestamp: {
              $gte: timeRange.start,
              $lte: timeRange.end
            }
          }
        });
      }
      return await this.analyticsRepository.findByEvent(event);
    } catch (error) {
      logger.error('Error in getEventAnalytics:', error);
      throw error;
    }
  }

  async getMetricsSummary(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    eventTypes: Record<string, number>;
    categories: Record<string, number>;
  }> {
    try {
      const cacheKey = `metrics_summary:${timeRange.start.toISOString()}_${timeRange.end.toISOString()}`;
      const cached = await redisGet(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const summary = await this.analyticsRepository.getMetricsSummary(timeRange);
      await redisSet(cacheKey, JSON.stringify(summary), this.CACHE_TTL);
      
      return summary;
    } catch (error) {
      logger.error('Error in getMetricsSummary:', error);
      throw error;
    }
  }

  async getAggregatedMetrics(options: {
    groupBy: 'hour' | 'day' | 'week' | 'month';
    timeRange: { start: Date; end: Date };
    metric: string;
  }): Promise<{ timestamp: Date; value: number }[]> {
    try {
      const cacheKey = `aggregated_metrics:${options.groupBy}:${options.metric}:${options.timeRange.start.toISOString()}_${options.timeRange.end.toISOString()}`;
      const cached = await redisGet(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const metrics = await this.analyticsRepository.getAggregatedMetrics(options);
      await redisSet(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);
      
      return metrics;
    } catch (error) {
      logger.error('Error in getAggregatedMetrics:', error);
      throw error;
    }
  }

  async getUserEngagementMetrics(userId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    averageSessionDuration: number;
    lastActive: Date;
  }> {
    try {
      const cacheKey = `user_engagement:${userId}`;
      const cached = await redisGet(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const analytics = await this.analyticsRepository.findByUser(userId);
      
      const eventsByType: Record<string, number> = {};
      let totalSessionDuration = 0;
      let sessionCount = 0;

      analytics.forEach(a => {
        eventsByType[a.type] = (eventsByType[a.type] || 0) + 1;
        if (a.session?.duration) {
          totalSessionDuration += a.session.duration;
          sessionCount++;
        }
      });

      const metrics = {
        totalEvents: analytics.length,
        eventsByType,
        averageSessionDuration: sessionCount > 0 ? totalSessionDuration / sessionCount : 0,
        lastActive: analytics[0]?.timestamp || new Date()
      };

      await redisSet(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);
      
      return metrics;
    } catch (error) {
      logger.error('Error in getUserEngagementMetrics:', error);
      throw error;
    }
  }

  async getSystemMetrics(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    errorRate: number;
    averageResponseTime: number;
    activeUsers: number;
  }> {
    try {
      const cacheKey = `system_metrics:${timeRange.start.toISOString()}_${timeRange.end.toISOString()}`;
      const cached = await redisGet(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const analytics = await this.analyticsRepository.findByTimeRange(timeRange.start, timeRange.end);
      
      const errors = analytics.filter(a => a.category === AnalyticsCategory.ERROR);
      const performanceEvents = analytics.filter(a => a.category === AnalyticsCategory.PERFORMANCE);
      const uniqueUsers = new Set(analytics.map(a => a.userId));

      const metrics = {
        totalEvents: analytics.length,
        errorRate: analytics.length > 0 ? errors.length / analytics.length : 0,
        averageResponseTime: performanceEvents.reduce((sum, a) => sum + (a.metrics?.duration || 0), 0) / performanceEvents.length || 0,
        activeUsers: uniqueUsers.size
      };

      await redisSet(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);
      
      return metrics;
    } catch (error) {
      logger.error('Error in getSystemMetrics:', error);
      throw error;
    }
  }

  private async invalidateMetricsCache(userId: string): Promise<void> {
    try {
      // Invalidate user-specific cache
      await redisSet(`user_engagement:${userId}`, '', 0);

      // Invalidate general metrics cache
      // Note: This is a simplified version. In production, you might want to be more selective
      // about which caches to invalidate based on the event type and category
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const cacheKeys = [
        `metrics_summary:${today.toISOString()}_${now.toISOString()}`,
        `system_metrics:${today.toISOString()}_${now.toISOString()}`
      ];

      await Promise.all(cacheKeys.map(key => redisSet(key, '', 0)));
    } catch (error) {
      logger.error('Error in invalidateMetricsCache:', error);
      // Don't throw here as this is a background operation
    }
  }
} 