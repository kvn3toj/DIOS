import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver(() => AnalyticsEntity)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => AnalyticsEntity)
  @UseGuards(GqlAuthGuard)
  async trackAnalytics(
    @Args('input') createAnalyticsDto: CreateAnalyticsDto
  ): Promise<AnalyticsEntity> {
    return this.analyticsService.trackEvent(createAnalyticsDto);
  }

  @Query(() => [AnalyticsEntity])
  @UseGuards(GqlAuthGuard)
  async analytics(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('type', { nullable: true }) type?: AnalyticsType,
    @Args('category', { nullable: true }) category?: AnalyticsCategory,
    @Args('userId', { nullable: true }) userId?: string
  ): Promise<AnalyticsEntity[]> {
    return this.analyticsService.findByTimeRange(startTime, endTime, { type, category, userId });
  }

  @Query(() => [AnalyticsEntity])
  @UseGuards(GqlAuthGuard)
  async userAnalytics(
    @Args('userId') userId: string,
    @Args('startTime', { nullable: true }) startTime?: Date,
    @Args('endTime', { nullable: true }) endTime?: Date
  ): Promise<AnalyticsEntity[]> {
    const timeRange = startTime && endTime ? { start: startTime, end: endTime } : undefined;
    return this.analyticsService.getUserAnalytics(userId, timeRange);
  }

  @Query(() => [AnalyticsEntity])
  @UseGuards(GqlAuthGuard)
  async eventAnalytics(
    @Args('event') event: string,
    @Args('startTime', { nullable: true }) startTime?: Date,
    @Args('endTime', { nullable: true }) endTime?: Date
  ): Promise<AnalyticsEntity[]> {
    const timeRange = startTime && endTime ? { start: startTime, end: endTime } : undefined;
    return this.analyticsService.getEventAnalytics(event, timeRange);
  }

  @Query(() => JSON)
  @UseGuards(GqlAuthGuard)
  async aggregatedMetrics(
    @Args('groupBy') groupBy: 'hour' | 'day' | 'week' | 'month',
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('type', { nullable: true }) type?: AnalyticsType,
    @Args('category', { nullable: true }) category?: AnalyticsCategory
  ): Promise<any[]> {
    return this.analyticsService.getAggregatedMetrics({
      groupBy,
      timeRange: { start: startTime, end: endTime },
      type,
      category
    });
  }

  @Query(() => JSON)
  @UseGuards(GqlAuthGuard)
  async metricsSummary(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date
  ): Promise<any> {
    return this.analyticsService.getMetricsSummary({ start: startTime, end: endTime });
  }

  @Query(() => JSON)
  @UseGuards(GqlAuthGuard)
  async analyticsReport(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('type', { nullable: true }) type?: AnalyticsType,
    @Args('category', { nullable: true }) category?: AnalyticsCategory,
    @Args('groupBy', { nullable: true }) groupBy?: 'hour' | 'day' | 'week' | 'month',
    @Args('metrics', { type: () => [String], nullable: true }) metrics?: string[]
  ): Promise<any> {
    return this.analyticsService.generateReport({
      timeRange: { start: startTime, end: endTime },
      type,
      category,
      groupBy,
      metrics
    });
  }

  @Mutation(() => AnalyticsEntity)
  @UseGuards(GqlAuthGuard)
  async updateAnalytics(
    @Args('id') id: string,
    @Args('input') updateAnalyticsDto: UpdateAnalyticsDto
  ): Promise<AnalyticsEntity> {
    return this.analyticsService.update(id, updateAnalyticsDto);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeAnalytics(@Args('id') id: string): Promise<boolean> {
    return this.analyticsService.remove(id);
  }
} 