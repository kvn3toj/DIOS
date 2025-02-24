import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

// Technical KPI interfaces
interface PerformanceMetrics {
  response: {
    p50: number;
    p95: number;
    p99: number;
  };
  availability: {
    uptime: number;
    reliability: number;
  };
  resources: {
    cpu: number;
    memory: number;
  };
}

interface QualityMetrics {
  errors: {
    rate: number;
    distribution: Record<string, number>;
  };
  testing: {
    coverage: number;
    success: number;
  };
}

// Business KPI interfaces
interface EngagementMetrics {
  users: {
    active: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    retention: {
      d1: number;
      d7: number;
      d30: number;
    };
  };
}

interface MonetizationMetrics {
  revenue: {
    daily: number;
    arpu: number;
    ltv: number;
  };
  conversion: {
    rate: number;
    value: number;
  };
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // Technical KPIs
  async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      // Collect response time metrics
      const responseTimes = await this.prisma.$queryRaw`
        SELECT 
          percentile_cont(0.50) WITHIN GROUP (ORDER BY response_time) as p50,
          percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
          percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time) as p99
        FROM request_logs
        WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      `;

      // Calculate availability metrics
      const availability = await this.prisma.$queryRaw`
        SELECT 
          (successful_requests::float / total_requests) * 100 as uptime,
          (successful_operations::float / total_operations) * 100 as reliability
        FROM system_health
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;

      // Get resource utilization
      const resources = await this.prisma.$queryRaw`
        SELECT 
          AVG(cpu_usage) as cpu,
          AVG(memory_usage) as memory
        FROM resource_metrics
        WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      `;

      return {
        response: responseTimes[0],
        availability: availability[0],
        resources: resources[0]
      };
    } catch (error) {
      this.logger.error('Failed to collect performance metrics:', error);
      throw error;
    }
  }

  async collectQualityMetrics(): Promise<QualityMetrics> {
    try {
      // Calculate error rates
      const errors = await this.prisma.$queryRaw`
        SELECT 
          (error_count::float / total_requests) * 100 as rate,
          error_distribution
        FROM error_metrics
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;

      // Get test metrics
      const testing = await this.prisma.$queryRaw`
        SELECT 
          coverage_percentage as coverage,
          success_rate as success
        FROM test_metrics
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      return {
        errors: errors[0],
        testing: testing[0]
      };
    } catch (error) {
      this.logger.error('Failed to collect quality metrics:', error);
      throw error;
    }
  }

  // Business KPIs
  async collectEngagementMetrics(): Promise<EngagementMetrics> {
    try {
      // Calculate active users
      const activeUsers = await this.prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT CASE WHEN last_active >= NOW() - INTERVAL '24 hours' THEN id END) as daily,
          COUNT(DISTINCT CASE WHEN last_active >= NOW() - INTERVAL '7 days' THEN id END) as weekly,
          COUNT(DISTINCT CASE WHEN last_active >= NOW() - INTERVAL '30 days' THEN id END) as monthly
        FROM users
      `;

      // Calculate retention rates
      const retention = await this.prisma.$queryRaw`
        SELECT 
          (d1_retained::float / total_users) * 100 as d1,
          (d7_retained::float / total_users) * 100 as d7,
          (d30_retained::float / total_users) * 100 as d30
        FROM user_retention
        WHERE cohort_date >= NOW() - INTERVAL '30 days'
      `;

      return {
        users: {
          active: activeUsers[0],
          retention: retention[0]
        }
      };
    } catch (error) {
      this.logger.error('Failed to collect engagement metrics:', error);
      throw error;
    }
  }

  async collectMonetizationMetrics(): Promise<MonetizationMetrics> {
    try {
      // Calculate revenue metrics
      const revenue = await this.prisma.$queryRaw`
        SELECT 
          SUM(amount) as daily,
          AVG(amount) as arpu,
          SUM(amount) / COUNT(DISTINCT user_id) as ltv
        FROM transactions
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;

      // Calculate conversion metrics
      const conversion = await this.prisma.$queryRaw`
        SELECT 
          (converted_users::float / total_users) * 100 as rate,
          AVG(conversion_value) as value
        FROM conversion_metrics
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;

      return {
        revenue: revenue[0],
        conversion: conversion[0]
      };
    } catch (error) {
      this.logger.error('Failed to collect monetization metrics:', error);
      throw error;
    }
  }

  // Alert thresholds
  async checkAlertThresholds(metrics: any): Promise<void> {
    try {
      const thresholds = await this.prisma.alertThresholds.findMany({
        where: { active: true }
      });

      for (const threshold of thresholds) {
        const value = this.getMetricValue(metrics, threshold.metricPath);
        if (this.isThresholdExceeded(value, threshold)) {
          await this.triggerAlert(threshold, value);
        }
      }
    } catch (error) {
      this.logger.error('Failed to check alert thresholds:', error);
      throw error;
    }
  }

  private getMetricValue(metrics: any, path: string): number {
    return path.split('.').reduce((obj, key) => obj[key], metrics);
  }

  private isThresholdExceeded(value: number, threshold: any): boolean {
    switch (threshold.operator) {
      case '>':
        return value > threshold.value;
      case '<':
        return value < threshold.value;
      case '>=':
        return value >= threshold.value;
      case '<=':
        return value <= threshold.value;
      default:
        return false;
    }
  }

  private async triggerAlert(threshold: any, value: number): Promise<void> {
    const alert = {
      metricName: threshold.metricPath,
      threshold: threshold.value,
      actualValue: value,
      timestamp: new Date(),
      severity: threshold.severity
    };

    await this.prisma.alerts.create({ data: alert });
    this.eventEmitter.emit('alert.triggered', alert);
  }
} 