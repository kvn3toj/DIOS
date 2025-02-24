import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    @InjectConnection() private defaultConnection: Connection
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database', { connection: this.defaultConnection }),
      
      // Memory usage check
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB
      
      // Disk usage check
      () => this.disk.checkStorage('storage', {
        thresholdPercent: 0.9,
        path: '/'
      }),
      
      // Custom check for active connections
      async () => {
        const connections = await this.defaultConnection.manager.query('SELECT count(*) FROM pg_stat_activity');
        return {
          activeConnections: {
            status: parseInt(connections[0].count) < 100 ? 'up' : 'down',
            message: `${connections[0].count} active connections`
          }
        };
      }
    ]);
  }

  @Get('metrics')
  async getMetrics() {
    const queryRunner = this.defaultConnection.createQueryRunner();
    
    try {
      const dbMetrics = await queryRunner.query(`
        SELECT
          (SELECT count(*) FROM pg_stat_activity) as active_connections,
          pg_database_size(current_database()) as database_size,
          (SELECT count(*) FROM analytics) as total_analytics,
          (SELECT count(*) FROM analytics WHERE "createdAt" > NOW() - INTERVAL '24 hours') as analytics_last_24h
      `);

      const memoryUsage = process.memoryUsage();
      
      return {
        database: {
          activeConnections: parseInt(dbMetrics[0].active_connections),
          databaseSize: parseInt(dbMetrics[0].database_size),
          totalAnalytics: parseInt(dbMetrics[0].total_analytics),
          analyticsLast24h: parseInt(dbMetrics[0].analytics_last_24h)
        },
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
    } finally {
      await queryRunner.release();
    }
  }
} 