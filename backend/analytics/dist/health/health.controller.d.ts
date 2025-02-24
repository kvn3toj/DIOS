import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { Connection } from 'typeorm';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private disk;
    private defaultConnection;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, defaultConnection: Connection);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    getMetrics(): Promise<{
        database: {
            activeConnections: number;
            databaseSize: number;
            totalAnalytics: number;
            analyticsLast24h: number;
        };
        memory: {
            heapUsed: number;
            heapTotal: number;
            external: number;
            rss: number;
        };
        uptime: number;
        timestamp: string;
    }>;
}
