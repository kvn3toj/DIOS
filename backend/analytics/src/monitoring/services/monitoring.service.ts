import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TechnicalMetric } from '../entities/technical-metric.entity';
import { BusinessMetric } from '../entities/business-metric.entity';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly updateInterval = 60000; // 1 minute

  // Technical KPI thresholds
  private readonly technicalThresholds = {
    response: {
      warning: 150, // ms
      critical: 250, // ms
    },
    availability: {
      target: 99.9, // %
      warning: 99.5,
    },
    cpu: {
      target: 60, // %
      warning: 80,
    },
    memory: {
      target: 70, // %
      warning: 85,
    },
    errorRate: {
      target: 0.1, // %
      warning: 0.5,
    },
  };

  // Business KPI thresholds
  private readonly businessThresholds = {
    dau: {
      target: 10000,
      warning: 8000,
    },
    retention: {
      d1: { target: 40, warning: 35 }, // %
      d7: { target: 20, warning: 15 },
      d30: { target: 10, warning: 8 },
    },
    revenue: {
      daily: { target: 5000, warning: 4000 }, // USD
      arpu: { target: 2.5, warning: 2.0 },
    },
    conversion: {
      rate: { target: 5, warning: 4 }, // %
    },
  };

  constructor(
    @InjectRepository(TechnicalMetric)
    private technicalMetricRepository: Repository<TechnicalMetric>,
    @InjectRepository(BusinessMetric)
    private businessMetricRepository: Repository<BusinessMetric>,
    private eventEmitter: EventEmitter2,
  ) {
    this.startMonitoring();
  }

  private startMonitoring() {
    setInterval(() => {
      this.collectMetrics();
    }, this.updateInterval);
  }

  private async collectMetrics() {
    try {
      const technicalMetrics = await this.collectTechnicalMetrics();
      const businessMetrics = await this.collectBusinessMetrics();

      await this.saveTechnicalMetrics(technicalMetrics);
      await this.saveBusinessMetrics(businessMetrics);

      this.checkThresholds(technicalMetrics, businessMetrics);
    } catch (error) {
      this.logger.error('Error collecting metrics', error);
      this.eventEmitter.emit('monitoring.error', error);
    }
  }

  private async collectTechnicalMetrics() {
    // Collect performance metrics
    const performance = await this.getPerformanceMetrics();
    
    // Collect availability metrics
    const availability = await this.getAvailabilityMetrics();
    
    // Collect resource metrics
    const resources = await this.getResourceMetrics();
    
    // Collect error metrics
    const errors = await this.getErrorMetrics();

    return {
      performance,
      availability,
      resources,
      errors,
      timestamp: new Date(),
    };
  }

  private async collectBusinessMetrics() {
    // Collect user engagement metrics
    const engagement = await this.getEngagementMetrics();
    
    // Collect monetization metrics
    const monetization = await this.getMonetizationMetrics();
    
    // Collect conversion metrics
    const conversion = await this.getConversionMetrics();

    return {
      engagement,
      monetization,
      conversion,
      timestamp: new Date(),
    };
  }

  private async getPerformanceMetrics() {
    // Implement performance metric collection
    return {
      responseTime: {
        p50: 0,
        p95: 0,
        p99: 0,
      },
    };
  }

  private async getAvailabilityMetrics() {
    // Implement availability metric collection
    return {
      uptime: 0,
      reliability: 0,
    };
  }

  private async getResourceMetrics() {
    // Implement resource metric collection
    return {
      cpu: {
        usage: 0,
        average: 0,
      },
      memory: {
        usage: 0,
        average: 0,
      },
    };
  }

  private async getErrorMetrics() {
    // Implement error metric collection
    return {
      rate: 0,
      distribution: {},
    };
  }

  private async getEngagementMetrics() {
    // Implement engagement metric collection
    return {
      dau: 0,
      wau: 0,
      mau: 0,
      retention: {
        d1: 0,
        d7: 0,
        d30: 0,
      },
    };
  }

  private async getMonetizationMetrics() {
    // Implement monetization metric collection
    return {
      revenue: {
        daily: 0,
        arpu: 0,
        ltv: 0,
      },
    };
  }

  private async getConversionMetrics() {
    // Implement conversion metric collection
    return {
      rate: 0,
      value: 0,
    };
  }

  private async saveTechnicalMetrics(metrics: any) {
    const technicalMetric = this.technicalMetricRepository.create(metrics);
    await this.technicalMetricRepository.save(technicalMetric);
  }

  private async saveBusinessMetrics(metrics: any) {
    const businessMetric = this.businessMetricRepository.create(metrics);
    await this.businessMetricRepository.save(businessMetric);
  }

  private checkThresholds(technicalMetrics: any, businessMetrics: any) {
    // Check technical thresholds
    this.checkTechnicalThresholds(technicalMetrics);
    
    // Check business thresholds
    this.checkBusinessThresholds(businessMetrics);
  }

  private checkTechnicalThresholds(metrics: any) {
    // Check response time thresholds
    if (metrics.performance.responseTime.p95 > this.technicalThresholds.response.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'technical',
        metric: 'response_time',
        value: metrics.performance.responseTime.p95,
        threshold: this.technicalThresholds.response.warning,
        severity: metrics.performance.responseTime.p95 > this.technicalThresholds.response.critical ? 'critical' : 'warning',
      });
    }

    // Check CPU usage thresholds
    if (metrics.resources.cpu.usage > this.technicalThresholds.cpu.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'technical',
        metric: 'cpu_usage',
        value: metrics.resources.cpu.usage,
        threshold: this.technicalThresholds.cpu.warning,
        severity: 'warning',
      });
    }

    // Check memory usage thresholds
    if (metrics.resources.memory.usage > this.technicalThresholds.memory.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'technical',
        metric: 'memory_usage',
        value: metrics.resources.memory.usage,
        threshold: this.technicalThresholds.memory.warning,
        severity: 'warning',
      });
    }

    // Check error rate thresholds
    if (metrics.errors.rate > this.technicalThresholds.errorRate.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'technical',
        metric: 'error_rate',
        value: metrics.errors.rate,
        threshold: this.technicalThresholds.errorRate.warning,
        severity: 'warning',
      });
    }
  }

  private checkBusinessThresholds(metrics: any) {
    // Check DAU thresholds
    if (metrics.engagement.dau < this.businessThresholds.dau.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'business',
        metric: 'dau',
        value: metrics.engagement.dau,
        threshold: this.businessThresholds.dau.warning,
        severity: 'warning',
      });
    }

    // Check retention thresholds
    Object.entries(metrics.engagement.retention).forEach(([period, value]: [string, any]) => {
      if (value < this.businessThresholds.retention[period].warning) {
        this.eventEmitter.emit('monitoring.alert', {
          type: 'business',
          metric: `retention_${period}`,
          value: value,
          threshold: this.businessThresholds.retention[period].warning,
          severity: 'warning',
        });
      }
    });

    // Check revenue thresholds
    if (metrics.monetization.revenue.daily < this.businessThresholds.revenue.daily.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'business',
        metric: 'daily_revenue',
        value: metrics.monetization.revenue.daily,
        threshold: this.businessThresholds.revenue.daily.warning,
        severity: 'warning',
      });
    }

    // Check conversion rate thresholds
    if (metrics.conversion.rate < this.businessThresholds.conversion.rate.warning) {
      this.eventEmitter.emit('monitoring.alert', {
        type: 'business',
        metric: 'conversion_rate',
        value: metrics.conversion.rate,
        threshold: this.businessThresholds.conversion.rate.warning,
        severity: 'warning',
      });
    }
  }

  // Public methods for retrieving metrics
  async getTechnicalMetrics(timeRange: { start: Date; end: Date }) {
    return this.technicalMetricRepository.find({
      where: {
        timestamp: {
          $gte: timeRange.start,
          $lte: timeRange.end,
        },
      },
      order: {
        timestamp: 'ASC',
      },
    });
  }

  async getBusinessMetrics(timeRange: { start: Date; end: Date }) {
    return this.businessMetricRepository.find({
      where: {
        timestamp: {
          $gte: timeRange.start,
          $lte: timeRange.end,
        },
      },
      order: {
        timestamp: 'ASC',
      },
    });
  }

  async getMetricsSummary() {
    const latestTechnical = await this.technicalMetricRepository.findOne({
      order: {
        timestamp: 'DESC',
      },
    });

    const latestBusiness = await this.businessMetricRepository.findOne({
      order: {
        timestamp: 'DESC',
      },
    });

    return {
      technical: latestTechnical,
      business: latestBusiness,
    };
  }
} 