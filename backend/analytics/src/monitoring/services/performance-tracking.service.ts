import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitoringMetric } from '../entities/monitoring-metric.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as os from 'os';

@Injectable()
export class PerformanceTrackingService {
  private readonly logger = new Logger(PerformanceTrackingService.name);
  private readonly updateInterval = 30000; // 30 seconds
  private readonly performanceThresholds = {
    cpu: {
      warning: 70,
      critical: 85
    },
    memory: {
      warning: 75,
      critical: 90
    },
    responseTime: {
      warning: 1000, // 1 second
      critical: 3000 // 3 seconds
    },
    errorRate: {
      warning: 1, // 1%
      critical: 5 // 5%
    }
  };

  constructor(
    @InjectRepository(MonitoringMetric)
    private readonly metricRepository: Repository<MonitoringMetric>,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.startPerformanceTracking();
  }

  private startPerformanceTracking() {
    setInterval(() => {
      this.trackPerformanceMetrics().catch(err => 
        this.logger.error('Error tracking performance metrics:', err)
      );
    }, this.updateInterval);
  }

  private async trackPerformanceMetrics() {
    const metrics = await this.collectPerformanceMetrics();
    await this.savePerformanceMetrics(metrics);
    await this.analyzePerformance(metrics);
    return metrics;
  }

  private async collectPerformanceMetrics() {
    const cpuUsage = await this.getCPUMetrics();
    const memoryMetrics = this.getMemoryMetrics();
    const processMetrics = this.getProcessMetrics();
    const networkMetrics = this.getNetworkMetrics();

    return {
      timestamp: new Date(),
      cpu: cpuUsage,
      memory: memoryMetrics,
      process: processMetrics,
      network: networkMetrics,
      type: 'performance' as const
    };
  }

  private async getCPUMetrics() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce(
      (acc, cpu) => acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0),
      0
    );
    const usage = ((totalTick - totalIdle) / totalTick) * 100;

    return {
      usage,
      cores: cpus.length,
      loadAverage: os.loadavg(),
      model: cpus[0].model,
      speed: cpus[0].speed
    };
  }

  private getMemoryMetrics() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercentage = (used / total) * 100;

    return {
      total,
      free,
      used,
      usagePercentage
    };
  }

  private getProcessMetrics() {
    const { heapTotal, heapUsed, external, rss } = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      uptime: process.uptime(),
      pid: process.pid,
      memory: {
        heapTotal,
        heapUsed,
        external,
        rss
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    };
  }

  private getNetworkMetrics() {
    const networkInterfaces = os.networkInterfaces();
    const connections = Object.entries(networkInterfaces).reduce((acc, [name, interfaces]) => {
      acc[name] = interfaces.map(iface => ({
        address: iface.address,
        netmask: iface.netmask,
        family: iface.family,
        mac: iface.mac,
        internal: iface.internal
      }));
      return acc;
    }, {});

    return {
      interfaces: connections,
      timestamp: new Date()
    };
  }

  private async savePerformanceMetrics(metrics: any) {
    try {
      const monitoringMetric = this.metricRepository.create({
        ...metrics,
        status: this.determineStatus(metrics)
      });
      await this.metricRepository.save(monitoringMetric);
    } catch (error) {
      this.logger.error('Error saving performance metrics:', error);
      throw error;
    }
  }

  private determineStatus(metrics: any): 'healthy' | 'warning' | 'critical' {
    if (
      metrics.cpu.usage >= this.performanceThresholds.cpu.critical ||
      metrics.memory.usagePercentage >= this.performanceThresholds.memory.critical
    ) {
      return 'critical';
    }

    if (
      metrics.cpu.usage >= this.performanceThresholds.cpu.warning ||
      metrics.memory.usagePercentage >= this.performanceThresholds.memory.warning
    ) {
      return 'warning';
    }

    return 'healthy';
  }

  private async analyzePerformance(metrics: any) {
    const status = this.determineStatus(metrics);
    
    if (status !== 'healthy') {
      const alerts = this.generateAlerts(metrics, status);
      this.eventEmitter.emit('performance.alert', alerts);
    }

    // Emit metrics for real-time monitoring
    this.eventEmitter.emit('performance.metrics', metrics);
  }

  private generateAlerts(metrics: any, status: 'warning' | 'critical') {
    const alerts = [];

    if (metrics.cpu.usage >= this.performanceThresholds.cpu[status]) {
      alerts.push({
        type: 'CPU',
        severity: status,
        message: `CPU usage is at ${metrics.cpu.usage.toFixed(2)}%`,
        timestamp: new Date()
      });
    }

    if (metrics.memory.usagePercentage >= this.performanceThresholds.memory[status]) {
      alerts.push({
        type: 'Memory',
        severity: status,
        message: `Memory usage is at ${metrics.memory.usagePercentage.toFixed(2)}%`,
        timestamp: new Date()
      });
    }

    return alerts;
  }

  // Public methods for external access
  async getPerformanceMetrics(timeRange?: { start: Date; end: Date }) {
    const query = this.metricRepository.createQueryBuilder('metric')
      .where('metric.type = :type', { type: 'performance' });

    if (timeRange) {
      query.andWhere('metric.timestamp BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end
      });
    }

    return query.orderBy('metric.timestamp', 'DESC').getMany();
  }

  async getPerformanceAnalytics(timeRange: { start: Date; end: Date }) {
    const metrics = await this.getPerformanceMetrics(timeRange);
    
    return {
      averageCpuUsage: this.calculateAverage(metrics.map(m => m.cpu.usage)),
      averageMemoryUsage: this.calculateAverage(metrics.map(m => m.memory.usagePercentage)),
      maxCpuUsage: Math.max(...metrics.map(m => m.cpu.usage)),
      maxMemoryUsage: Math.max(...metrics.map(m => m.memory.usagePercentage)),
      alertsCount: metrics.filter(m => m.status !== 'healthy').length,
      timeRange
    };
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0
      ? values.reduce((acc, val) => acc + val, 0) / values.length
      : 0;
  }
} 