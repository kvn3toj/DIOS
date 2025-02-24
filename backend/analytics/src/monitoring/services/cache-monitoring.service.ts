import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheMetric } from '../entities/cache-metric.entity';

@Injectable()
export class CacheMonitoringService {
  private readonly logger = new Logger(CacheMonitoringService.name);
  private readonly updateInterval = 60000; // 1 minute
  private readonly thresholds = {
    hitRate: {
      warning: 85, // %
      critical: 75,
    },
    memoryUsage: {
      warning: 80, // %
      critical: 90,
    },
    evictionRate: {
      warning: 100, // per minute
      critical: 200,
    },
    latency: {
      warning: 50, // ms
      critical: 100,
    },
  };

  constructor(
    @InjectRepository(CacheMetric)
    private readonly cacheMetricRepository: Repository<CacheMetric>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.startCacheMonitoring();
  }

  private startCacheMonitoring() {
    setInterval(() => {
      this.collectMetrics().catch(err => 
        this.logger.error('Failed to collect cache metrics:', err)
      );
    }, this.updateInterval);
  }

  async collectMetrics() {
    const metrics = await this.gatherCacheMetrics();
    await this.saveMetrics(metrics);
    await this.checkThresholds(metrics);
    return metrics;
  }

  private async gatherCacheMetrics() {
    // In a real implementation, these would be actual cache queries
    // Example for Redis:
    // const info = await redis.info();
    return {
      timestamp: new Date(),
      ...await this.getRedisMetrics(),
      ...await this.getMemcachedMetrics(),
      ...await this.getApplicationCacheMetrics(),
    };
  }

  private async getRedisMetrics() {
    // Example Redis metrics collection
    return {
      redis: {
        hitRate: Math.random() * 100,
        missRate: Math.random() * 20,
        memoryUsage: Math.random() * 100,
        evictionCount: Math.floor(Math.random() * 100),
        connectedClients: Math.floor(Math.random() * 1000),
        commandsProcessed: Math.floor(Math.random() * 10000),
        keyspaceHits: Math.floor(Math.random() * 5000),
        keyspaceMisses: Math.floor(Math.random() * 1000),
        latency: Math.random() * 50,
      },
    };
  }

  private async getMemcachedMetrics() {
    // Example Memcached metrics collection
    return {
      memcached: {
        hitRate: Math.random() * 100,
        missRate: Math.random() * 20,
        memoryUsage: Math.random() * 100,
        evictionCount: Math.floor(Math.random() * 100),
        currentConnections: Math.floor(Math.random() * 500),
        totalItems: Math.floor(Math.random() * 10000),
        getHits: Math.floor(Math.random() * 5000),
        getMisses: Math.floor(Math.random() * 1000),
        latency: Math.random() * 50,
      },
    };
  }

  private async getApplicationCacheMetrics() {
    // Example application-level cache metrics
    return {
      application: {
        routeCache: {
          hitRate: Math.random() * 100,
          size: Math.floor(Math.random() * 1000),
          entries: Math.floor(Math.random() * 100),
        },
        dataCache: {
          hitRate: Math.random() * 100,
          size: Math.floor(Math.random() * 5000),
          entries: Math.floor(Math.random() * 500),
        },
        queryCache: {
          hitRate: Math.random() * 100,
          size: Math.floor(Math.random() * 2000),
          entries: Math.floor(Math.random() * 200),
        },
      },
    };
  }

  private async saveMetrics(metrics: any) {
    try {
      const cacheMetric = this.cacheMetricRepository.create(metrics);
      await this.cacheMetricRepository.save(cacheMetric);
    } catch (error) {
      this.logger.error('Failed to save cache metrics:', error);
      throw error;
    }
  }

  private async checkThresholds(metrics: any) {
    const alerts = [];

    // Check Redis metrics
    if (metrics.redis.hitRate < this.thresholds.hitRate.critical) {
      alerts.push({
        type: 'redis_hit_rate',
        severity: 'critical',
        message: `Low Redis hit rate: ${metrics.redis.hitRate}%`,
      });
    } else if (metrics.redis.hitRate < this.thresholds.hitRate.warning) {
      alerts.push({
        type: 'redis_hit_rate',
        severity: 'warning',
        message: `Suboptimal Redis hit rate: ${metrics.redis.hitRate}%`,
      });
    }

    if (metrics.redis.memoryUsage > this.thresholds.memoryUsage.critical) {
      alerts.push({
        type: 'redis_memory',
        severity: 'critical',
        message: `High Redis memory usage: ${metrics.redis.memoryUsage}%`,
      });
    } else if (metrics.redis.memoryUsage > this.thresholds.memoryUsage.warning) {
      alerts.push({
        type: 'redis_memory',
        severity: 'warning',
        message: `Elevated Redis memory usage: ${metrics.redis.memoryUsage}%`,
      });
    }

    // Check Memcached metrics
    if (metrics.memcached.hitRate < this.thresholds.hitRate.critical) {
      alerts.push({
        type: 'memcached_hit_rate',
        severity: 'critical',
        message: `Low Memcached hit rate: ${metrics.memcached.hitRate}%`,
      });
    } else if (metrics.memcached.hitRate < this.thresholds.hitRate.warning) {
      alerts.push({
        type: 'memcached_hit_rate',
        severity: 'warning',
        message: `Suboptimal Memcached hit rate: ${metrics.memcached.hitRate}%`,
      });
    }

    if (metrics.memcached.memoryUsage > this.thresholds.memoryUsage.critical) {
      alerts.push({
        type: 'memcached_memory',
        severity: 'critical',
        message: `High Memcached memory usage: ${metrics.memcached.memoryUsage}%`,
      });
    } else if (metrics.memcached.memoryUsage > this.thresholds.memoryUsage.warning) {
      alerts.push({
        type: 'memcached_memory',
        severity: 'warning',
        message: `Elevated Memcached memory usage: ${metrics.memcached.memoryUsage}%`,
      });
    }

    // Check application cache metrics
    for (const [cacheType, metrics] of Object.entries(metrics.application)) {
      if (metrics.hitRate < this.thresholds.hitRate.critical) {
        alerts.push({
          type: `${cacheType}_hit_rate`,
          severity: 'critical',
          message: `Low ${cacheType} hit rate: ${metrics.hitRate}%`,
        });
      } else if (metrics.hitRate < this.thresholds.hitRate.warning) {
        alerts.push({
          type: `${cacheType}_hit_rate`,
          severity: 'warning',
          message: `Suboptimal ${cacheType} hit rate: ${metrics.hitRate}%`,
        });
      }
    }

    // Emit alerts
    alerts.forEach(alert => {
      this.eventEmitter.emit('cache.alert', alert);
    });

    return alerts;
  }

  async getCacheMetrics(timeRange?: { start: Date; end: Date }) {
    const query = this.cacheMetricRepository.createQueryBuilder('metric');

    if (timeRange) {
      query.where('metric.timestamp BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end,
      });
    }

    return query.orderBy('metric.timestamp', 'DESC').getMany();
  }

  async getCacheAnalytics(timeRange: { start: Date; end: Date }) {
    const metrics = await this.getCacheMetrics(timeRange);

    return {
      redis: {
        performance: {
          avgHitRate: this.calculateAverage(metrics.map(m => m.redis.hitRate)),
          avgLatency: this.calculateAverage(metrics.map(m => m.redis.latency)),
          evictionRate: this.calculateEvictionRate(metrics.map(m => m.redis.evictionCount)),
          trend: this.calculateTrend(metrics.map(m => ({ value: m.redis.hitRate, timestamp: m.timestamp }))),
        },
        usage: {
          avgMemoryUsage: this.calculateAverage(metrics.map(m => m.redis.memoryUsage)),
          peakMemoryUsage: Math.max(...metrics.map(m => m.redis.memoryUsage)),
          avgConnections: this.calculateAverage(metrics.map(m => m.redis.connectedClients)),
        },
      },
      memcached: {
        performance: {
          avgHitRate: this.calculateAverage(metrics.map(m => m.memcached.hitRate)),
          avgLatency: this.calculateAverage(metrics.map(m => m.memcached.latency)),
          evictionRate: this.calculateEvictionRate(metrics.map(m => m.memcached.evictionCount)),
          trend: this.calculateTrend(metrics.map(m => ({ value: m.memcached.hitRate, timestamp: m.timestamp }))),
        },
        usage: {
          avgMemoryUsage: this.calculateAverage(metrics.map(m => m.memcached.memoryUsage)),
          peakMemoryUsage: Math.max(...metrics.map(m => m.memcached.memoryUsage)),
          avgConnections: this.calculateAverage(metrics.map(m => m.memcached.currentConnections)),
        },
      },
      application: {
        routeCache: {
          avgHitRate: this.calculateAverage(metrics.map(m => m.application.routeCache.hitRate)),
          avgSize: this.calculateAverage(metrics.map(m => m.application.routeCache.size)),
          trend: this.calculateTrend(metrics.map(m => ({ value: m.application.routeCache.hitRate, timestamp: m.timestamp }))),
        },
        dataCache: {
          avgHitRate: this.calculateAverage(metrics.map(m => m.application.dataCache.hitRate)),
          avgSize: this.calculateAverage(metrics.map(m => m.application.dataCache.size)),
          trend: this.calculateTrend(metrics.map(m => ({ value: m.application.dataCache.hitRate, timestamp: m.timestamp }))),
        },
        queryCache: {
          avgHitRate: this.calculateAverage(metrics.map(m => m.application.queryCache.hitRate)),
          avgSize: this.calculateAverage(metrics.map(m => m.application.queryCache.size)),
          trend: this.calculateTrend(metrics.map(m => ({ value: m.application.queryCache.hitRate, timestamp: m.timestamp }))),
        },
      },
    };
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateEvictionRate(evictionCounts: number[]): number {
    if (evictionCounts.length < 2) return 0;
    const timeSpanMinutes = evictionCounts.length;
    const totalEvictions = evictionCounts.reduce((sum, count) => sum + count, 0);
    return totalEvictions / timeSpanMinutes;
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