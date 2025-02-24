import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(@Body() createAnalyticsDto: CreateAnalyticsDto): Promise<AnalyticsEntity> {
    return this.analyticsService.trackEvent(createAnalyticsDto);
  }

  @Get()
  async findAll(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('type') type?: AnalyticsType,
    @Query('category') category?: AnalyticsCategory,
    @Query('userId') userId?: string
  ): Promise<AnalyticsEntity[]> {
    return this.analyticsService.findByTimeRange(
      new Date(startTime),
      new Date(endTime),
      { type, category, userId }
    );
  }

  @Get('user/:userId')
  async getUserAnalytics(
    @Param('userId') userId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string
  ): Promise<AnalyticsEntity[]> {
    const timeRange = startTime && endTime
      ? { start: new Date(startTime), end: new Date(endTime) }
      : undefined;
    return this.analyticsService.getUserAnalytics(userId, timeRange);
  }

  @Get('event/:event')
  async getEventAnalytics(
    @Param('event') event: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string
  ): Promise<AnalyticsEntity[]> {
    const timeRange = startTime && endTime
      ? { start: new Date(startTime), end: new Date(endTime) }
      : undefined;
    return this.analyticsService.getEventAnalytics(event, timeRange);
  }

  @Get('metrics/aggregated')
  async getAggregatedMetrics(
    @Query('groupBy') groupBy: 'hour' | 'day' | 'week' | 'month',
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('type') type?: AnalyticsType,
    @Query('category') category?: AnalyticsCategory
  ): Promise<any[]> {
    return this.analyticsService.getAggregatedMetrics({
      groupBy,
      timeRange: {
        start: new Date(startTime),
        end: new Date(endTime)
      },
      type,
      category
    });
  }

  @Get('metrics/summary')
  async getMetricsSummary(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ): Promise<any> {
    return this.analyticsService.getMetricsSummary({
      start: new Date(startTime),
      end: new Date(endTime)
    });
  }

  @Get('report')
  async generateReport(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('type') type?: AnalyticsType,
    @Query('category') category?: AnalyticsCategory,
    @Query('groupBy') groupBy?: 'hour' | 'day' | 'week' | 'month',
    @Query('metrics') metrics?: string
  ): Promise<any> {
    return this.analyticsService.generateReport({
      timeRange: {
        start: new Date(startTime),
        end: new Date(endTime)
      },
      type,
      category,
      groupBy,
      metrics: metrics ? metrics.split(',') : undefined
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnalyticsDto: UpdateAnalyticsDto
  ): Promise<AnalyticsEntity> {
    return this.analyticsService.update(id, updateAnalyticsDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<boolean> {
    return this.analyticsService.remove(id);
  }
} 