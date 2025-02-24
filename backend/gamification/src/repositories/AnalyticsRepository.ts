import { FindOptionsWhere, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { Analytics, AnalyticsType, AnalyticsCategory } from '../models/Analytics';
import { logger } from '../utils/logger';

export class AnalyticsRepository extends BaseRepository<Analytics> {
  constructor() {
    super(Analytics);
  }

  async findByUser(userId: string, relations: string[] = []): Promise<Analytics[]> {
    try {
      return await this.find({
        where: { userId } as FindOptionsWhere<Analytics>,
        relations,
        order: {
          timestamp: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByUser:', error);
      throw error;
    }
  }

  async findByType(type: AnalyticsType, relations: string[] = []): Promise<Analytics[]> {
    try {
      return await this.find({
        where: { type } as FindOptionsWhere<Analytics>,
        relations,
        order: {
          timestamp: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByType:', error);
      throw error;
    }
  }

  async findByCategory(category: AnalyticsCategory, relations: string[] = []): Promise<Analytics[]> {
    try {
      return await this.find({
        where: { category } as FindOptionsWhere<Analytics>,
        relations,
        order: {
          timestamp: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByCategory:', error);
      throw error;
    }
  }

  async findByTimeRange(
    startTime: Date,
    endTime: Date,
    relations: string[] = []
  ): Promise<Analytics[]> {
    try {
      return await this.find({
        where: {
          timestamp: Between(startTime, endTime)
        } as FindOptionsWhere<Analytics>,
        relations,
        order: {
          timestamp: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByTimeRange:', error);
      throw error;
    }
  }

  async findByEvent(event: string, relations: string[] = []): Promise<Analytics[]> {
    try {
      return await this.find({
        where: { event } as FindOptionsWhere<Analytics>,
        relations,
        order: {
          timestamp: 'DESC'
        }
      });
    } catch (error) {
      logger.error('Error in findByEvent:', error);
      throw error;
    }
  }

  async findBySession(sessionId: string, relations: string[] = []): Promise<Analytics[]> {
    try {
      return await this.find({
        where: {
          'session.id': sessionId
        } as FindOptionsWhere<Analytics>,
        relations,
        order: {
          timestamp: 'ASC'
        }
      });
    } catch (error) {
      logger.error('Error in findBySession:', error);
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
      const analytics = await this.findByTimeRange(timeRange.start, timeRange.end);
      
      const uniqueUsers = new Set(analytics.map(a => a.userId)).size;
      const eventTypes: Record<string, number> = {};
      const categories: Record<string, number> = {};

      analytics.forEach(a => {
        eventTypes[a.type] = (eventTypes[a.type] || 0) + 1;
        categories[a.category] = (categories[a.category] || 0) + 1;
      });

      return {
        totalEvents: analytics.length,
        uniqueUsers,
        eventTypes,
        categories
      };
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
      // Implementation depends on the database being used
      // This is a placeholder that would need to be implemented based on specific DB capabilities
      const analytics = await this.findByTimeRange(options.timeRange.start, options.timeRange.end);
      
      // Group and aggregate the data based on the groupBy option
      // This is a simplified version
      const aggregated = new Map<string, number>();
      
      analytics.forEach(a => {
        const timestamp = this.truncateDate(a.timestamp, options.groupBy);
        const key = timestamp.toISOString();
        const value = a.metrics?.value || 0;
        aggregated.set(key, (aggregated.get(key) || 0) + value);
      });

      return Array.from(aggregated.entries()).map(([timestamp, value]) => ({
        timestamp: new Date(timestamp),
        value
      }));
    } catch (error) {
      logger.error('Error in getAggregatedMetrics:', error);
      throw error;
    }
  }

  private truncateDate(date: Date, precision: 'hour' | 'day' | 'week' | 'month'): Date {
    const d = new Date(date);
    switch (precision) {
      case 'hour':
        d.setMinutes(0, 0, 0);
        break;
      case 'day':
        d.setHours(0, 0, 0, 0);
        break;
      case 'week':
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        break;
      case 'month':
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        break;
    }
    return d;
  }
} 