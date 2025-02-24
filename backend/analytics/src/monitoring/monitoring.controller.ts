import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PerformanceTrackingService } from './services/performance-tracking.service';
import { ErrorTrackingService } from './error-tracking.service';
import { ResourceMonitoringService } from './services/resource-monitoring.service';
import { NetworkMonitoringService } from './services/network-monitoring.service';
import { DatabaseMonitoringService } from './services/database-monitoring.service';
import { CacheMonitoringService } from './services/cache-monitoring.service';

@ApiTags('Monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly performanceService: PerformanceTrackingService,
    private readonly errorTrackingService: ErrorTrackingService,
    private readonly resourceMonitoringService: ResourceMonitoringService,
    private readonly networkMonitoringService: NetworkMonitoringService,
    private readonly databaseMonitoringService: DatabaseMonitoringService,
    private readonly cacheMonitoringService: CacheMonitoringService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'Returns the current system health status' })
  async getHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns system metrics for the specified time range' })
  async getMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.monitoringService.getMetrics(timeRange);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns performance metrics for the specified time range' })
  async getPerformanceMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.performanceService.getPerformanceMetrics(timeRange);
  }

  @Get('performance/analytics')
  @ApiOperation({ summary: 'Get performance analytics' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns performance analytics for the specified time range' })
  async getPerformanceAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return this.performanceService.getPerformanceAnalytics(timeRange);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get system alerts' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns system alerts for the specified time range' })
  async getAlerts(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.monitoringService.getAlerts(timeRange);
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get resource metrics' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns resource metrics for the specified time range' })
  async getResourceMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.resourceMonitoringService.getResourceMetrics(timeRange);
  }

  @Get('resources/analytics')
  @ApiOperation({ summary: 'Get resource analytics' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns resource analytics for the specified time range' })
  async getResourceAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return this.resourceMonitoringService.getResourceAnalytics(timeRange);
  }

  @Get('resources/current')
  @ApiOperation({ summary: 'Get current resource metrics' })
  @ApiResponse({ status: 200, description: 'Returns current resource metrics' })
  async getCurrentResourceMetrics() {
    return this.resourceMonitoringService.collectMetrics();
  }

  @Get('network')
  @ApiOperation({ summary: 'Get network metrics' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns network metrics for the specified time range' })
  async getNetworkMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.networkMonitoringService.getNetworkMetrics(timeRange);
  }

  @Get('network/analytics')
  @ApiOperation({ summary: 'Get network analytics' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns network analytics for the specified time range' })
  async getNetworkAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return this.networkMonitoringService.getNetworkAnalytics(timeRange);
  }

  @Get('network/current')
  @ApiOperation({ summary: 'Get current network metrics' })
  @ApiResponse({ status: 200, description: 'Returns current network metrics' })
  async getCurrentNetworkMetrics() {
    return this.networkMonitoringService.collectMetrics();
  }

  @Get('database')
  @ApiOperation({ summary: 'Get database metrics' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns database metrics for the specified time range' })
  async getDatabaseMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.databaseMonitoringService.getDatabaseMetrics(timeRange);
  }

  @Get('database/analytics')
  @ApiOperation({ summary: 'Get database analytics' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns database analytics for the specified time range' })
  async getDatabaseAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return this.databaseMonitoringService.getDatabaseAnalytics(timeRange);
  }

  @Get('database/current')
  @ApiOperation({ summary: 'Get current database metrics' })
  @ApiResponse({ status: 200, description: 'Returns current database metrics' })
  async getCurrentDatabaseMetrics() {
    return this.databaseMonitoringService.collectMetrics();
  }

  @Get('cache')
  @ApiOperation({ summary: 'Get cache metrics' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns cache metrics for the specified time range' })
  async getCacheMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.cacheMonitoringService.getCacheMetrics(timeRange);
  }

  @Get('cache/analytics')
  @ApiOperation({ summary: 'Get cache analytics' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns cache analytics for the specified time range' })
  async getCacheAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return this.cacheMonitoringService.getCacheAnalytics(timeRange);
  }

  @Get('cache/current')
  @ApiOperation({ summary: 'Get current cache metrics' })
  @ApiResponse({ status: 200, description: 'Returns current cache metrics' })
  async getCurrentCacheMetrics() {
    return this.cacheMonitoringService.collectMetrics();
  }

  @Get('technical')
  @ApiOperation({ summary: 'Get technical metrics for a time range' })
  @ApiQuery({ name: 'start', required: true, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: true, type: String, description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Technical metrics retrieved successfully' })
  async getTechnicalMetrics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };
    return this.monitoringService.getTechnicalMetrics(timeRange);
  }

  @Get('business')
  @ApiOperation({ summary: 'Get business metrics for a time range' })
  @ApiQuery({ name: 'start', required: true, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: true, type: String, description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Business metrics retrieved successfully' })
  async getBusinessMetrics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };
    return this.monitoringService.getBusinessMetrics(timeRange);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get latest metrics summary' })
  @ApiResponse({ status: 200, description: 'Metrics summary retrieved successfully' })
  async getMetricsSummary() {
    return this.monitoringService.getMetricsSummary();
  }
}