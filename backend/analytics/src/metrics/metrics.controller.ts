import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { MetricsService } from './metrics.service';
import { SystemMetricEntity, SystemMetricType } from './entities/system-metric.entity';
import { PerformanceMetricEntity, PerformanceMetricType } from './entities/performance-metric.entity';
import { ResourceMetricEntity, ResourceType, ResourceMetricType } from './entities/resource-metric.entity';

@ApiTags('Metrics')
@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('system')
  @ApiOperation({ summary: 'Record a system metric' })
  @ApiResponse({ status: 201, type: SystemMetricEntity })
  async recordSystemMetric(@Body() data: {
    type: SystemMetricType;
    service: string;
    instance: string;
    value: number;
    metadata: any;
    tags?: Record<string, string>;
  }): Promise<SystemMetricEntity> {
    return this.metricsService.recordSystemMetric(data);
  }

  @Post('performance')
  @ApiOperation({ summary: 'Record a performance metric' })
  @ApiResponse({ status: 201, type: PerformanceMetricEntity })
  async recordPerformanceMetric(@Body() data: {
    type: PerformanceMetricType;
    endpoint: string;
    method: string;
    value: number;
    count?: number;
    metadata: any;
    breakdown?: any;
  }): Promise<PerformanceMetricEntity> {
    return this.metricsService.recordPerformanceMetric(data);
  }

  @Post('resource')
  @ApiOperation({ summary: 'Record a resource metric' })
  @ApiResponse({ status: 201, type: ResourceMetricEntity })
  async recordResourceMetric(@Body() data: {
    resourceType: ResourceType;
    metricType: ResourceMetricType;
    resourceName: string;
    region?: string;
    value: number;
    metadata: any;
    status?: any;
  }): Promise<ResourceMetricEntity> {
    return this.metricsService.recordResourceMetric(data);
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, type: [SystemMetricEntity] })
  async getSystemMetrics(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('type') type?: SystemMetricType,
    @Query('service') service?: string,
    @Query('instance') instance?: string
  ): Promise<SystemMetricEntity[]> {
    return this.metricsService.getSystemMetrics({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      service,
      instance
    });
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, type: [PerformanceMetricEntity] })
  async getPerformanceMetrics(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('type') type?: PerformanceMetricType,
    @Query('endpoint') endpoint?: string,
    @Query('method') method?: string
  ): Promise<PerformanceMetricEntity[]> {
    return this.metricsService.getPerformanceMetrics({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      type,
      endpoint,
      method
    });
  }

  @Get('resource')
  @ApiOperation({ summary: 'Get resource metrics' })
  @ApiResponse({ status: 200, type: [ResourceMetricEntity] })
  async getResourceMetrics(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('resourceType') resourceType?: ResourceType,
    @Query('metricType') metricType?: ResourceMetricType,
    @Query('resourceName') resourceName?: string,
    @Query('region') region?: string
  ): Promise<ResourceMetricEntity[]> {
    return this.metricsService.getResourceMetrics({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      resourceType,
      metricType,
      resourceName,
      region
    });
  }

  @Get('aggregated')
  @ApiOperation({ summary: 'Get aggregated metrics' })
  @ApiResponse({ status: 200, type: 'object' })
  async getAggregatedMetrics(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('groupBy') groupBy: 'minute' | 'hour' | 'day',
    @Query('type') type: 'system' | 'performance' | 'resource',
    @Query('filters') filters?: string
  ): Promise<any[]> {
    return this.metricsService.getAggregatedMetrics({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      groupBy,
      type,
      filters: filters ? JSON.parse(filters) : undefined
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get metrics summary' })
  @ApiResponse({ status: 200, type: 'object' })
  async getMetricsSummary(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ): Promise<any> {
    return this.metricsService.getMetricsSummary({
      start: new Date(startTime),
      end: new Date(endTime)
    });
  }

  @Get('report')
  @ApiOperation({ summary: 'Generate metrics report' })
  @ApiResponse({ status: 200, type: 'object' })
  async generateReport(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('types') types: string,
    @Query('groupBy') groupBy?: string,
    @Query('filters') filters?: string
  ): Promise<any> {
    return this.metricsService.generateReport({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      types: types.split(','),
      groupBy,
      filters: filters ? JSON.parse(filters) : undefined
    });
  }
} 