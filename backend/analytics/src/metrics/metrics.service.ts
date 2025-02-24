import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { SystemMetricEntity, SystemMetricType } from './entities/system-metric.entity';
import { PerformanceMetricEntity, PerformanceMetricType } from './entities/performance-metric.entity';
import { ResourceMetricEntity, ResourceType, ResourceMetricType } from './entities/resource-metric.entity';
import { MetricsCollectorService } from './services/metrics-collector.service';
import { MetricsProcessorService } from './services/metrics-processor.service';
import { AlertingService } from './services/alerting.service';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(SystemMetricEntity)
    private readonly systemMetricsRepository: Repository<SystemMetricEntity>,
    @InjectRepository(PerformanceMetricEntity)
    private readonly performanceMetricsRepository: Repository<PerformanceMetricEntity>,
    @InjectRepository(ResourceMetricEntity)
    private readonly resourceMetricsRepository: Repository<ResourceMetricEntity>,
    @Inject('RABBITMQ_SERVICE')
    private readonly messageQueue: ClientProxy,
    private readonly metricsCollector: MetricsCollectorService,
    private readonly metricsProcessor: MetricsProcessorService,
    private readonly alertingService: AlertingService
  ) {}

  async recordSystemMetric(data: {
    type: SystemMetricType;
    service: string;
    instance: string;
    value: number;
    metadata: any;
    tags?: Record<string, string>;
  }): Promise<SystemMetricEntity> {
    const metric = this.systemMetricsRepository.create({
      ...data,
      timestamp: new Date()
    });

    await this.systemMetricsRepository.save(metric);
    await this.messageQueue.emit('metrics.system_recorded', metric);
    await this.alertingService.checkSystemMetric(metric);

    return metric;
  }

  async recordPerformanceMetric(data: {
    type: PerformanceMetricType;
    endpoint: string;
    method: string;
    value: number;
    count?: number;
    metadata: any;
    breakdown?: any;
  }): Promise<PerformanceMetricEntity> {
    const metric = this.performanceMetricsRepository.create({
      ...data,
      timestamp: new Date()
    });

    await this.performanceMetricsRepository.save(metric);
    await this.messageQueue.emit('metrics.performance_recorded', metric);
    await this.alertingService.checkPerformanceMetric(metric);

    return metric;
  }

  async recordResourceMetric(data: {
    resourceType: ResourceType;
    metricType: ResourceMetricType;
    resourceName: string;
    region?: string;
    value: number;
    metadata: any;
    status?: any;
  }): Promise<ResourceMetricEntity> {
    const metric = this.resourceMetricsRepository.create({
      ...data,
      timestamp: new Date()
    });

    await this.resourceMetricsRepository.save(metric);
    await this.messageQueue.emit('metrics.resource_recorded', metric);
    await this.alertingService.checkResourceMetric(metric);

    return metric;
  }

  async getSystemMetrics(options: {
    startTime: Date;
    endTime: Date;
    type?: SystemMetricType;
    service?: string;
    instance?: string;
  }): Promise<SystemMetricEntity[]> {
    const where: FindOptionsWhere<SystemMetricEntity> = {
      timestamp: Between(options.startTime, options.endTime)
    };

    if (options.type) where.type = options.type;
    if (options.service) where.service = options.service;
    if (options.instance) where.instance = options.instance;

    return this.systemMetricsRepository.find({
      where,
      order: { timestamp: 'DESC' }
    });
  }

  async getPerformanceMetrics(options: {
    startTime: Date;
    endTime: Date;
    type?: PerformanceMetricType;
    endpoint?: string;
    method?: string;
  }): Promise<PerformanceMetricEntity[]> {
    const where: FindOptionsWhere<PerformanceMetricEntity> = {
      timestamp: Between(options.startTime, options.endTime)
    };

    if (options.type) where.type = options.type;
    if (options.endpoint) where.endpoint = options.endpoint;
    if (options.method) where.method = options.method;

    return this.performanceMetricsRepository.find({
      where,
      order: { timestamp: 'DESC' }
    });
  }

  async getResourceMetrics(options: {
    startTime: Date;
    endTime: Date;
    resourceType?: ResourceType;
    metricType?: ResourceMetricType;
    resourceName?: string;
    region?: string;
  }): Promise<ResourceMetricEntity[]> {
    const where: FindOptionsWhere<ResourceMetricEntity> = {
      timestamp: Between(options.startTime, options.endTime)
    };

    if (options.resourceType) where.resourceType = options.resourceType;
    if (options.metricType) where.metricType = options.metricType;
    if (options.resourceName) where.resourceName = options.resourceName;
    if (options.region) where.region = options.region;

    return this.resourceMetricsRepository.find({
      where,
      order: { timestamp: 'DESC' }
    });
  }

  async getAggregatedMetrics(options: {
    startTime: Date;
    endTime: Date;
    groupBy: 'minute' | 'hour' | 'day';
    type: 'system' | 'performance' | 'resource';
    filters?: Record<string, any>;
  }): Promise<any[]> {
    return this.metricsProcessor.getAggregatedMetrics(options);
  }

  async getMetricsSummary(timeRange: { start: Date; end: Date }): Promise<any> {
    return this.metricsProcessor.getMetricsSummary(timeRange);
  }

  async generateReport(options: {
    startTime: Date;
    endTime: Date;
    types: string[];
    groupBy?: string;
    filters?: Record<string, any>;
  }): Promise<any> {
    return this.metricsProcessor.generateReport(options);
  }
} 