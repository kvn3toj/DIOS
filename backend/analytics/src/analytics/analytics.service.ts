import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { RealTimeAnalyticsService } from './services/real-time-analytics.service';
import { BatchAnalyticsService } from './services/batch-analytics.service';
import { AggregationService } from './services/aggregation.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEntity)
    private readonly analyticsRepository: Repository<AnalyticsEntity>,
    @Inject('RABBITMQ_SERVICE')
    private readonly messageQueue: ClientProxy,
    private readonly realTimeAnalytics: RealTimeAnalyticsService,
    private readonly batchAnalytics: BatchAnalyticsService,
    private readonly aggregationService: AggregationService
  ) {}

  async trackEvent(data: CreateAnalyticsDto): Promise<AnalyticsEntity> {
    const analytics = this.analyticsRepository.create({
      ...data,
      timestamp: new Date()
    });

    await this.analyticsRepository.save(analytics);
    await this.messageQueue.emit('analytics.event_tracked', analytics);
    await this.realTimeAnalytics.processEvent(analytics);

    return analytics;
  }

  async findByTimeRange(
    startTime: Date,
    endTime: Date,
    filters?: {
      type?: AnalyticsType;
      category?: AnalyticsCategory;
      userId?: string;
    }
  ): Promise<AnalyticsEntity[]> {
    const where: FindOptionsWhere<AnalyticsEntity> = {
      timestamp: Between(startTime, endTime),
      ...filters
    };

    return this.analyticsRepository.find({
      where,
      order: { timestamp: 'DESC' }
    });
  }

  async getAggregatedMetrics(options: {
    groupBy: 'hour' | 'day' | 'week' | 'month';
    timeRange: { start: Date; end: Date };
    type?: AnalyticsType;
    category?: AnalyticsCategory;
  }): Promise<any[]> {
    return this.aggregationService.getAggregatedMetrics(options);
  }

  async getUserAnalytics(userId: string, timeRange?: { start: Date; end: Date }): Promise<AnalyticsEntity[]> {
    const where: FindOptionsWhere<AnalyticsEntity> = { userId };
    
    if (timeRange) {
      where.timestamp = Between(timeRange.start, timeRange.end);
    }

    return this.analyticsRepository.find({
      where,
      order: { timestamp: 'DESC' }
    });
  }

  async getEventAnalytics(event: string, timeRange?: { start: Date; end: Date }): Promise<AnalyticsEntity[]> {
    const where: FindOptionsWhere<AnalyticsEntity> = { event };
    
    if (timeRange) {
      where.timestamp = Between(timeRange.start, timeRange.end);
    }

    return this.analyticsRepository.find({
      where,
      order: { timestamp: 'DESC' }
    });
  }

  async update(id: string, updateAnalyticsDto: UpdateAnalyticsDto): Promise<AnalyticsEntity> {
    await this.analyticsRepository.update(id, updateAnalyticsDto);
    return this.analyticsRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.analyticsRepository.delete(id);
    return result.affected > 0;
  }

  async getMetricsSummary(timeRange: { start: Date; end: Date }): Promise<any> {
    return this.batchAnalytics.getMetricsSummary(timeRange);
  }

  async generateReport(options: {
    timeRange: { start: Date; end: Date };
    type?: AnalyticsType;
    category?: AnalyticsCategory;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
    metrics?: string[];
  }): Promise<any> {
    return this.batchAnalytics.generateReport(options);
  }
} 