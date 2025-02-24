import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseMetric } from '../entities/database-metric.entity';

@Injectable()
export class DatabaseMonitoringService {
  private readonly logger = new Logger(DatabaseMonitoringService.name);
  private readonly updateInterval = 60000; // 1 minute
  private readonly thresholds = {
    queryTime: {
      warning: 1000, // ms
      critical: 3000, // ms
    },
    connections: {
      warning: 80, // % of max connections
      critical: 90,
    },
    deadlocks: {
      warning: 5, // per minute
      critical: 10,
    },
    cacheHitRatio: {
      warning: 85, // %
      critical: 75,
    },
  };

  constructor(
    @InjectRepository(DatabaseMetric)
    private readonly databaseMetricRepository: Repository<DatabaseMetric>,
    private readonly connection: Connection,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.startDatabaseMonitoring();
  }

  private startDatabaseMonitoring() {
    setInterval(() => {
      this.collectMetrics().catch(err => 
        this.logger.error('Failed to collect database metrics:', err)
      );
    }, this.updateInterval);
  }

  async collectMetrics() {
    const metrics = await this.gatherDatabaseMetrics();
    await this.saveMetrics(metrics);
    await this.checkThresholds(metrics);
    return metrics;
  }

  private async gatherDatabaseMetrics() {
    const queryRunner = this.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      
      const [
        connectionStats,
        performanceStats,
        cacheStats,
        tableStats
      ] = await Promise.all([
        this.getConnectionStats(queryRunner),
        this.getPerformanceStats(queryRunner),
        this.getCacheStats(queryRunner),
        this.getTableStats(queryRunner),
      ]);

      return {
        timestamp: new Date(),
        ...connectionStats,
        ...performanceStats,
        ...cacheStats,
        ...tableStats,
      };
    } finally {
      await queryRunner.release();
    }
  }

  private async getConnectionStats(queryRunner: QueryRunner) {
    // In a real implementation, these would be actual database queries
    // Example for PostgreSQL:
    // SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';
    return {
      activeConnections: Math.floor(Math.random() * 100),
      idleConnections: Math.floor(Math.random() * 50),
      maxConnections: 100,
      connectionUtilization: Math.random() * 100,
      waitingQueries: Math.floor(Math.random() * 10),
    };
  }

  private async getPerformanceStats(queryRunner: QueryRunner) {
    // Example queries for PostgreSQL:
    // SELECT * FROM pg_stat_database WHERE datname = current_database();
    return {
      avgQueryTime: Math.random() * 1000, // ms
      slowQueries: Math.floor(Math.random() * 10),
      deadlocks: Math.floor(Math.random() * 5),
      rollbacks: Math.floor(Math.random() * 10),
      transactions: {
        active: Math.floor(Math.random() * 50),
        committed: Math.floor(Math.random() * 1000),
        rolledBack: Math.floor(Math.random() * 10),
      },
    };
  }

  private async getCacheStats(queryRunner: QueryRunner) {
    // Example for PostgreSQL:
    // SELECT * FROM pg_statio_user_tables;
    return {
      cacheHitRatio: Math.random() * 100,
      indexHitRatio: Math.random() * 100,
      bufferCacheHitRatio: Math.random() * 100,
      sharedBufferUsage: Math.random() * 100,
    };
  }

  private async getTableStats(queryRunner: QueryRunner) {
    // Example for PostgreSQL:
    // SELECT * FROM pg_stat_user_tables;
    return {
      tableStats: {
        totalRows: Math.floor(Math.random() * 1000000),
        totalSize: Math.floor(Math.random() * 10000000),
        indexSize: Math.floor(Math.random() * 1000000),
        scanTypes: {
          seqScans: Math.floor(Math.random() * 1000),
          indexScans: Math.floor(Math.random() * 10000),
        },
      },
      vacuumStats: {
        lastAutoVacuum: new Date(Date.now() - Math.random() * 86400000),
        autoVacuumCount: Math.floor(Math.random() * 100),
      },
    };
  }

  private async saveMetrics(metrics: any) {
    try {
      const databaseMetric = this.databaseMetricRepository.create(metrics);
      await this.databaseMetricRepository.save(databaseMetric);
    } catch (error) {
      this.logger.error('Failed to save database metrics:', error);
      throw error;
    }
  }

  private async checkThresholds(metrics: any) {
    const alerts = [];

    // Check query time
    if (metrics.avgQueryTime > this.thresholds.queryTime.critical) {
      alerts.push({
        type: 'query_time',
        severity: 'critical',
        message: `High average query time: ${metrics.avgQueryTime}ms`,
      });
    } else if (metrics.avgQueryTime > this.thresholds.queryTime.warning) {
      alerts.push({
        type: 'query_time',
        severity: 'warning',
        message: `Elevated average query time: ${metrics.avgQueryTime}ms`,
      });
    }

    // Check connections
    const connectionPercentage = (metrics.activeConnections / metrics.maxConnections) * 100;
    if (connectionPercentage > this.thresholds.connections.critical) {
      alerts.push({
        type: 'connections',
        severity: 'critical',
        message: `High connection utilization: ${connectionPercentage}%`,
      });
    } else if (connectionPercentage > this.thresholds.connections.warning) {
      alerts.push({
        type: 'connections',
        severity: 'warning',
        message: `Elevated connection utilization: ${connectionPercentage}%`,
      });
    }

    // Check deadlocks
    if (metrics.deadlocks > this.thresholds.deadlocks.critical) {
      alerts.push({
        type: 'deadlocks',
        severity: 'critical',
        message: `High number of deadlocks: ${metrics.deadlocks}`,
      });
    } else if (metrics.deadlocks > this.thresholds.deadlocks.warning) {
      alerts.push({
        type: 'deadlocks',
        severity: 'warning',
        message: `Elevated number of deadlocks: ${metrics.deadlocks}`,
      });
    }

    // Check cache hit ratio
    if (metrics.cacheHitRatio < this.thresholds.cacheHitRatio.critical) {
      alerts.push({
        type: 'cache_hit_ratio',
        severity: 'critical',
        message: `Low cache hit ratio: ${metrics.cacheHitRatio}%`,
      });
    } else if (metrics.cacheHitRatio < this.thresholds.cacheHitRatio.warning) {
      alerts.push({
        type: 'cache_hit_ratio',
        severity: 'warning',
        message: `Suboptimal cache hit ratio: ${metrics.cacheHitRatio}%`,
      });
    }

    // Emit alerts
    alerts.forEach(alert => {
      this.eventEmitter.emit('database.alert', alert);
    });

    return alerts;
  }

  async getDatabaseMetrics(timeRange?: { start: Date; end: Date }) {
    const query = this.databaseMetricRepository.createQueryBuilder('metric');

    if (timeRange) {
      query.where('metric.timestamp BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end,
      });
    }

    return query.orderBy('metric.timestamp', 'DESC').getMany();
  }

  async getDatabaseAnalytics(timeRange: { start: Date; end: Date }) {
    const metrics = await this.getDatabaseMetrics(timeRange);

    return {
      performance: {
        avgQueryTime: this.calculateAverage(metrics.map(m => m.avgQueryTime)),
        slowQueriesTotal: metrics.reduce((sum, m) => sum + m.slowQueries, 0),
        deadlocksTotal: metrics.reduce((sum, m) => sum + m.deadlocks, 0),
        queryTimeTrend: this.calculateTrend(metrics.map(m => ({ value: m.avgQueryTime, timestamp: m.timestamp }))),
      },
      connections: {
        avgUtilization: this.calculateAverage(metrics.map(m => m.connectionUtilization)),
        peakUtilization: Math.max(...metrics.map(m => m.connectionUtilization)),
        trend: this.calculateTrend(metrics.map(m => ({ value: m.connectionUtilization, timestamp: m.timestamp }))),
      },
      cache: {
        avgHitRatio: this.calculateAverage(metrics.map(m => m.cacheHitRatio)),
        trend: this.calculateTrend(metrics.map(m => ({ value: m.cacheHitRatio, timestamp: m.timestamp }))),
      },
      transactions: {
        totalCommitted: metrics.reduce((sum, m) => sum + m.transactions.committed, 0),
        totalRolledBack: metrics.reduce((sum, m) => sum + m.transactions.rolledBack, 0),
        successRate: this.calculateTransactionSuccessRate(metrics),
      },
    };
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateTransactionSuccessRate(metrics: any[]): number {
    const totalCommitted = metrics.reduce((sum, m) => sum + m.transactions.committed, 0);
    const totalRolledBack = metrics.reduce((sum, m) => sum + m.transactions.rolledBack, 0);
    const total = totalCommitted + totalRolledBack;
    return total > 0 ? (totalCommitted / total) * 100 : 100;
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