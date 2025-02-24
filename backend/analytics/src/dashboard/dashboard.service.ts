import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { ChartService } from './services/chart.service';
import { WidgetService } from './services/widget.service';
import { AnalyticsType, AnalyticsCategory } from '../analytics/entities/analytics.entity';

@Injectable()
export class DashboardService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly chartService: ChartService,
    private readonly widgetService: WidgetService
  ) {}

  async getDashboardData(timeRange: { start: Date; end: Date }) {
    const [
      userMetrics,
      systemMetrics,
      performanceMetrics,
      eventDistribution
    ] = await Promise.all([
      this.getUserMetrics(timeRange),
      this.getSystemMetrics(timeRange),
      this.getPerformanceMetrics(timeRange),
      this.getEventDistribution(timeRange)
    ]);

    return {
      userMetrics,
      systemMetrics,
      performanceMetrics,
      eventDistribution
    };
  }

  private async getUserMetrics(timeRange: { start: Date; end: Date }) {
    const data = await this.analyticsService.getAggregatedMetrics({
      groupBy: 'day',
      timeRange,
      type: AnalyticsType.USER
    });

    return this.chartService.generateTimeSeriesChart({
      data,
      title: 'User Activity',
      xAxis: 'Date',
      yAxis: 'Number of Events'
    });
  }

  private async getSystemMetrics(timeRange: { start: Date; end: Date }) {
    const data = await this.analyticsService.getAggregatedMetrics({
      groupBy: 'hour',
      timeRange,
      type: AnalyticsType.SYSTEM
    });

    return this.chartService.generateTimeSeriesChart({
      data,
      title: 'System Events',
      xAxis: 'Time',
      yAxis: 'Event Count'
    });
  }

  private async getPerformanceMetrics(timeRange: { start: Date; end: Date }) {
    const data = await this.analyticsService.getAggregatedMetrics({
      groupBy: 'hour',
      timeRange,
      type: AnalyticsType.PERFORMANCE
    });

    return this.chartService.generatePerformanceChart({
      data,
      title: 'System Performance',
      metrics: ['responseTime', 'cpuUsage', 'memoryUsage']
    });
  }

  private async getEventDistribution(timeRange: { start: Date; end: Date }) {
    const data = await this.analyticsService.getAggregatedMetrics({
      groupBy: 'day',
      timeRange
    });

    return this.chartService.generatePieChart({
      data,
      title: 'Event Distribution by Type',
      categories: Object.values(AnalyticsType)
    });
  }

  async getCustomWidget(options: {
    type: string;
    timeRange: { start: Date; end: Date };
    metrics?: string[];
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }) {
    const data = await this.analyticsService.getAggregatedMetrics({
      groupBy: options.groupBy || 'day',
      timeRange: options.timeRange,
      metrics: options.metrics
    });

    return this.widgetService.generateWidget({
      type: options.type,
      data,
      title: `Custom ${options.type} Widget`
    });
  }
} 