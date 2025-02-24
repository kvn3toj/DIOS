import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { MetricsService } from './metrics.service';
import { SystemMetricEntity, SystemMetricType } from './entities/system-metric.entity';
import { PerformanceMetricEntity, PerformanceMetricType } from './entities/performance-metric.entity';
import { ResourceMetricEntity, ResourceType, ResourceMetricType } from './entities/resource-metric.entity';

@Resolver()
@UseGuards(JwtAuthGuard)
export class MetricsResolver {
  constructor(private readonly metricsService: MetricsService) {}

  @Mutation(() => SystemMetricEntity)
  async recordSystemMetric(
    @Args('type') type: SystemMetricType,
    @Args('service') service: string,
    @Args('instance') instance: string,
    @Args('value') value: number,
    @Args('metadata') metadata: any,
    @Args('tags', { nullable: true }) tags?: Record<string, string>
  ): Promise<SystemMetricEntity> {
    return this.metricsService.recordSystemMetric({
      type,
      service,
      instance,
      value,
      metadata,
      tags
    });
  }

  @Mutation(() => PerformanceMetricEntity)
  async recordPerformanceMetric(
    @Args('type') type: PerformanceMetricType,
    @Args('endpoint') endpoint: string,
    @Args('method') method: string,
    @Args('value') value: number,
    @Args('count', { nullable: true }) count?: number,
    @Args('metadata') metadata: any,
    @Args('breakdown', { nullable: true }) breakdown?: any
  ): Promise<PerformanceMetricEntity> {
    return this.metricsService.recordPerformanceMetric({
      type,
      endpoint,
      method,
      value,
      count,
      metadata,
      breakdown
    });
  }

  @Mutation(() => ResourceMetricEntity)
  async recordResourceMetric(
    @Args('resourceType') resourceType: ResourceType,
    @Args('metricType') metricType: ResourceMetricType,
    @Args('resourceName') resourceName: string,
    @Args('region', { nullable: true }) region: string,
    @Args('value') value: number,
    @Args('metadata') metadata: any,
    @Args('status', { nullable: true }) status?: any
  ): Promise<ResourceMetricEntity> {
    return this.metricsService.recordResourceMetric({
      resourceType,
      metricType,
      resourceName,
      region,
      value,
      metadata,
      status
    });
  }

  @Query(() => [SystemMetricEntity])
  async systemMetrics(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('type', { nullable: true }) type?: SystemMetricType,
    @Args('service', { nullable: true }) service?: string,
    @Args('instance', { nullable: true }) instance?: string
  ): Promise<SystemMetricEntity[]> {
    return this.metricsService.getSystemMetrics({
      startTime,
      endTime,
      type,
      service,
      instance
    });
  }

  @Query(() => [PerformanceMetricEntity])
  async performanceMetrics(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('type', { nullable: true }) type?: PerformanceMetricType,
    @Args('endpoint', { nullable: true }) endpoint?: string,
    @Args('method', { nullable: true }) method?: string
  ): Promise<PerformanceMetricEntity[]> {
    return this.metricsService.getPerformanceMetrics({
      startTime,
      endTime,
      type,
      endpoint,
      method
    });
  }

  @Query(() => [ResourceMetricEntity])
  async resourceMetrics(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('resourceType', { nullable: true }) resourceType?: ResourceType,
    @Args('metricType', { nullable: true }) metricType?: ResourceMetricType,
    @Args('resourceName', { nullable: true }) resourceName?: string,
    @Args('region', { nullable: true }) region?: string
  ): Promise<ResourceMetricEntity[]> {
    return this.metricsService.getResourceMetrics({
      startTime,
      endTime,
      resourceType,
      metricType,
      resourceName,
      region
    });
  }

  @Query(() => [JSON])
  async aggregatedMetrics(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('groupBy') groupBy: 'minute' | 'hour' | 'day',
    @Args('type') type: 'system' | 'performance' | 'resource',
    @Args('filters', { nullable: true }) filters?: Record<string, any>
  ): Promise<any[]> {
    return this.metricsService.getAggregatedMetrics({
      startTime,
      endTime,
      groupBy,
      type,
      filters
    });
  }

  @Query(() => JSON)
  async metricsSummary(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date
  ): Promise<any> {
    return this.metricsService.getMetricsSummary({
      start: startTime,
      end: endTime
    });
  }

  @Query(() => JSON)
  async metricsReport(
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
    @Args('types', { type: () => [String] }) types: string[],
    @Args('groupBy', { nullable: true }) groupBy?: string,
    @Args('filters', { nullable: true }) filters?: Record<string, any>
  ): Promise<any> {
    return this.metricsService.generateReport({
      startTime,
      endTime,
      types,
      groupBy,
      filters
    });
  }
} 