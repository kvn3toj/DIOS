import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as os from 'os';
import * as fs from 'fs/promises';
import { ResourceMetric } from '../entities/resource-metric.entity';

@Injectable()
export class ResourceMonitoringService {
  private readonly logger = new Logger(ResourceMonitoringService.name);
  private readonly thresholds = {
    cpu: {
      target: 60, // 60%
      warning: 70,
      critical: 80
    },
    memory: {
      target: 70, // 70%
      warning: 80,
      critical: 85
    },
    disk: {
      target: 70, // 70%
      warning: 80,
      critical: 90
    }
  };

  constructor(
    @InjectRepository(ResourceMetric)
    private readonly resourceMetricRepository: Repository<ResourceMetric>,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.startResourceMonitoring();
  }

  private startResourceMonitoring() {
    setInterval(() => {
      this.collectMetrics().catch(err =>
        this.logger.error('Error collecting metrics:', err)
      );
    }, 300000); // Every 5 minutes
  }

  async collectMetrics() {
    const metrics = await this.gatherResourceMetrics();
    await this.saveMetrics(metrics);
    await this.checkThresholds(metrics);
    return metrics;
  }

  private async gatherResourceMetrics() {
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const diskUsage = await this.getDiskUsage();
    const networkStats = await this.getNetworkStats();

    return {
      timestamp: new Date(),
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkStats
    };
  }

  private async getCPUUsage(): Promise<number> {
    const cpus = os.cpus();
    const totalCPU = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0);
    
    return totalCPU / cpus.length;
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  private async getDiskUsage(): Promise<{ used: number; total: number; percentage: number }> {
    try {
      const stats = await fs.stat('/');
      const total = stats.size;
      const used = total - stats.blocks;
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    } catch (error) {
      this.logger.error('Error getting disk usage:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  private async getNetworkStats(): Promise<{ bytesIn: number; bytesOut: number }> {
    const networkInterfaces = os.networkInterfaces();
    let bytesIn = 0;
    let bytesOut = 0;

    Object.values(networkInterfaces).forEach(interfaces => {
      interfaces?.forEach(iface => {
        if (!iface.internal) {
          // Note: This is a simplified version. In a real implementation,
          // you would track actual network I/O using system-specific tools
          bytesIn += iface.internal ? 0 : 1000; // Placeholder
          bytesOut += iface.internal ? 0 : 1000; // Placeholder
        }
      });
    });

    return { bytesIn, bytesOut };
  }

  private async saveMetrics(metrics: any) {
    const resourceMetric = this.resourceMetricRepository.create({
      timestamp: metrics.timestamp,
      cpuUsage: metrics.cpu,
      memoryUsed: metrics.memory.used,
      memoryTotal: metrics.memory.total,
      memoryPercentage: metrics.memory.percentage,
      diskUsed: metrics.disk.used,
      diskTotal: metrics.disk.total,
      diskPercentage: metrics.disk.percentage,
      networkBytesIn: metrics.network.bytesIn,
      networkBytesOut: metrics.network.bytesOut
    });

    await this.resourceMetricRepository.save(resourceMetric);
  }

  private async checkThresholds(metrics: any) {
    // CPU Threshold Check
    if (metrics.cpu >= this.thresholds.cpu.critical) {
      this.eventEmitter.emit('resource.cpu.critical', {
        value: metrics.cpu,
        threshold: this.thresholds.cpu.critical,
        timestamp: metrics.timestamp
      });
    } else if (metrics.cpu >= this.thresholds.cpu.warning) {
      this.eventEmitter.emit('resource.cpu.warning', {
        value: metrics.cpu,
        threshold: this.thresholds.cpu.warning,
        timestamp: metrics.timestamp
      });
    }

    // Memory Threshold Check
    if (metrics.memory.percentage >= this.thresholds.memory.critical) {
      this.eventEmitter.emit('resource.memory.critical', {
        value: metrics.memory.percentage,
        threshold: this.thresholds.memory.critical,
        timestamp: metrics.timestamp
      });
    } else if (metrics.memory.percentage >= this.thresholds.memory.warning) {
      this.eventEmitter.emit('resource.memory.warning', {
        value: metrics.memory.percentage,
        threshold: this.thresholds.memory.warning,
        timestamp: metrics.timestamp
      });
    }

    // Disk Threshold Check
    if (metrics.disk.percentage >= this.thresholds.disk.critical) {
      this.eventEmitter.emit('resource.disk.critical', {
        value: metrics.disk.percentage,
        threshold: this.thresholds.disk.critical,
        timestamp: metrics.timestamp
      });
    } else if (metrics.disk.percentage >= this.thresholds.disk.warning) {
      this.eventEmitter.emit('resource.disk.warning', {
        value: metrics.disk.percentage,
        threshold: this.thresholds.disk.warning,
        timestamp: metrics.timestamp
      });
    }
  }

  async getResourceMetrics(timeRange?: { start: Date; end: Date }) {
    const query = this.resourceMetricRepository.createQueryBuilder('metric');

    if (timeRange) {
      query.where('metric.timestamp BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end
      });
    }

    return query.orderBy('metric.timestamp', 'DESC').getMany();
  }

  async getResourceAnalytics(timeRange: { start: Date; end: Date }) {
    const metrics = await this.getResourceMetrics(timeRange);
    
    return {
      averages: {
        cpu: this.calculateAverage(metrics.map(m => m.cpuUsage)),
        memory: this.calculateAverage(metrics.map(m => m.memoryPercentage)),
        disk: this.calculateAverage(metrics.map(m => m.diskPercentage))
      },
      peaks: {
        cpu: Math.max(...metrics.map(m => m.cpuUsage)),
        memory: Math.max(...metrics.map(m => m.memoryPercentage)),
        disk: Math.max(...metrics.map(m => m.diskPercentage))
      },
      trends: {
        cpu: this.calculateTrend(metrics.map(m => ({ value: m.cpuUsage, timestamp: m.timestamp }))),
        memory: this.calculateTrend(metrics.map(m => ({ value: m.memoryPercentage, timestamp: m.timestamp }))),
        disk: this.calculateTrend(metrics.map(m => ({ value: m.diskPercentage, timestamp: m.timestamp })))
      },
      timeRange
    };
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateTrend(data: Array<{ value: number; timestamp: Date }>): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf.map(d => d.value));
    const secondAvg = this.calculateAverage(secondHalf.map(d => d.value));
    
    const difference = secondAvg - firstAvg;
    if (difference > 1) return 'increasing';
    if (difference < -1) return 'decreasing';
    return 'stable';
  }
} 