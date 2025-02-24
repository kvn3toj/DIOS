import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as os from 'os';
import { NetworkMetric } from '../entities/network-metric.entity';

@Injectable()
export class NetworkMonitoringService {
  private readonly logger = new Logger(NetworkMonitoringService.name);
  private readonly updateInterval = 60000; // 1 minute
  private readonly thresholds = {
    latency: {
      warning: 100, // ms
      critical: 200, // ms
    },
    packetLoss: {
      warning: 1, // %
      critical: 5, // %
    },
    bandwidth: {
      warning: 80, // % utilization
      critical: 90,
    },
    errorRate: {
      warning: 1, // %
      critical: 2,
    },
  };

  constructor(
    @InjectRepository(NetworkMetric)
    private readonly networkMetricRepository: Repository<NetworkMetric>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.startNetworkMonitoring();
  }

  private startNetworkMonitoring() {
    setInterval(() => {
      this.collectMetrics().catch(err => 
        this.logger.error('Failed to collect network metrics:', err)
      );
    }, this.updateInterval);
  }

  async collectMetrics() {
    const metrics = await this.gatherNetworkMetrics();
    await this.saveMetrics(metrics);
    await this.checkThresholds(metrics);
    return metrics;
  }

  private async gatherNetworkMetrics() {
    const networkStats = await this.getNetworkStats();
    const latencyStats = await this.getLatencyStats();
    const connectivityStats = await this.getConnectivityStats();
    const throughputStats = await this.getThroughputStats();

    return {
      timestamp: new Date(),
      ...networkStats,
      ...latencyStats,
      ...connectivityStats,
      ...throughputStats,
    };
  }

  private async getNetworkStats() {
    const interfaces = os.networkInterfaces();
    const stats = {
      bytesIn: 0,
      bytesOut: 0,
      packetsIn: 0,
      packetsOut: 0,
      errors: 0,
      dropped: 0,
    };

    Object.values(interfaces).forEach(iface => {
      if (iface) {
        iface.forEach(details => {
          if (details.family === 'IPv4') {
            // Collect interface statistics
            // In a real implementation, this would use system calls or network monitoring libraries
            stats.bytesIn += Math.random() * 1000000;
            stats.bytesOut += Math.random() * 1000000;
            stats.packetsIn += Math.random() * 1000;
            stats.packetsOut += Math.random() * 1000;
            stats.errors += Math.random() * 10;
            stats.dropped += Math.random() * 10;
          }
        });
      }
    });

    return stats;
  }

  private async getLatencyStats() {
    // In a real implementation, this would perform actual network latency measurements
    return {
      avgLatency: Math.random() * 100, // ms
      maxLatency: Math.random() * 200, // ms
      minLatency: Math.random() * 20, // ms
      jitter: Math.random() * 10, // ms
    };
  }

  private async getConnectivityStats() {
    // In a real implementation, this would check actual network connectivity
    return {
      packetLoss: Math.random() * 2, // %
      connectionStatus: 'connected',
      activeConnections: Math.floor(Math.random() * 1000),
      connectionErrors: Math.floor(Math.random() * 10),
    };
  }

  private async getThroughputStats() {
    // In a real implementation, this would measure actual network throughput
    return {
      bandwidth: {
        incoming: Math.random() * 100000000, // bytes/s
        outgoing: Math.random() * 100000000, // bytes/s
      },
      utilization: Math.random() * 100, // %
      saturation: Math.random() * 100, // %
    };
  }

  private async saveMetrics(metrics: any) {
    try {
      const networkMetric = this.networkMetricRepository.create(metrics);
      await this.networkMetricRepository.save(networkMetric);
    } catch (error) {
      this.logger.error('Failed to save network metrics:', error);
      throw error;
    }
  }

  private async checkThresholds(metrics: any) {
    const alerts = [];

    // Check latency
    if (metrics.avgLatency > this.thresholds.latency.critical) {
      alerts.push({
        type: 'latency',
        severity: 'critical',
        message: `High latency detected: ${metrics.avgLatency}ms`,
      });
    } else if (metrics.avgLatency > this.thresholds.latency.warning) {
      alerts.push({
        type: 'latency',
        severity: 'warning',
        message: `Elevated latency detected: ${metrics.avgLatency}ms`,
      });
    }

    // Check packet loss
    if (metrics.packetLoss > this.thresholds.packetLoss.critical) {
      alerts.push({
        type: 'packet_loss',
        severity: 'critical',
        message: `High packet loss detected: ${metrics.packetLoss}%`,
      });
    } else if (metrics.packetLoss > this.thresholds.packetLoss.warning) {
      alerts.push({
        type: 'packet_loss',
        severity: 'warning',
        message: `Elevated packet loss detected: ${metrics.packetLoss}%`,
      });
    }

    // Check bandwidth utilization
    if (metrics.utilization > this.thresholds.bandwidth.critical) {
      alerts.push({
        type: 'bandwidth',
        severity: 'critical',
        message: `High bandwidth utilization: ${metrics.utilization}%`,
      });
    } else if (metrics.utilization > this.thresholds.bandwidth.warning) {
      alerts.push({
        type: 'bandwidth',
        severity: 'warning',
        message: `Elevated bandwidth utilization: ${metrics.utilization}%`,
      });
    }

    // Emit alerts
    alerts.forEach(alert => {
      this.eventEmitter.emit('network.alert', alert);
    });

    return alerts;
  }

  async getNetworkMetrics(timeRange?: { start: Date; end: Date }) {
    const query = this.networkMetricRepository.createQueryBuilder('metric');

    if (timeRange) {
      query.where('metric.timestamp BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end,
      });
    }

    return query.orderBy('metric.timestamp', 'DESC').getMany();
  }

  async getNetworkAnalytics(timeRange: { start: Date; end: Date }) {
    const metrics = await this.getNetworkMetrics(timeRange);

    return {
      latency: {
        average: this.calculateAverage(metrics.map(m => m.avgLatency)),
        max: Math.max(...metrics.map(m => m.maxLatency)),
        min: Math.min(...metrics.map(m => m.minLatency)),
        trend: this.calculateTrend(metrics.map(m => ({ value: m.avgLatency, timestamp: m.timestamp }))),
      },
      packetLoss: {
        average: this.calculateAverage(metrics.map(m => m.packetLoss)),
        trend: this.calculateTrend(metrics.map(m => ({ value: m.packetLoss, timestamp: m.timestamp }))),
      },
      bandwidth: {
        averageUtilization: this.calculateAverage(metrics.map(m => m.utilization)),
        peakUtilization: Math.max(...metrics.map(m => m.utilization)),
        trend: this.calculateTrend(metrics.map(m => ({ value: m.utilization, timestamp: m.timestamp }))),
      },
      errors: {
        total: metrics.reduce((sum, m) => sum + m.connectionErrors, 0),
        trend: this.calculateTrend(metrics.map(m => ({ value: m.connectionErrors, timestamp: m.timestamp }))),
      },
    };
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateTrend(data: Array<{ value: number; timestamp: Date }>): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const values = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(d => d.value);
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    
    const threshold = 0.1; // 10% change threshold
    
    if (secondAvg > firstAvg * (1 + threshold)) return 'increasing';
    if (secondAvg < firstAvg * (1 - threshold)) return 'decreasing';
    return 'stable';
  }
} 