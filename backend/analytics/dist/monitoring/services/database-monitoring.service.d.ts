import { Repository, Connection } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DatabaseMetric } from '../entities/database-metric.entity';
export declare class DatabaseMonitoringService {
    private readonly databaseMetricRepository;
    private readonly connection;
    private readonly eventEmitter;
    private readonly logger;
    private readonly updateInterval;
    private readonly thresholds;
    constructor(databaseMetricRepository: Repository<DatabaseMetric>, connection: Connection, eventEmitter: EventEmitter2);
    private startDatabaseMonitoring;
    collectMetrics(): Promise<{
        tableStats: {
            totalRows: number;
            totalSize: number;
            indexSize: number;
            scanTypes: {
                seqScans: number;
                indexScans: number;
            };
        };
        vacuumStats: {
            lastAutoVacuum: Date;
            autoVacuumCount: number;
        };
        cacheHitRatio: number;
        indexHitRatio: number;
        bufferCacheHitRatio: number;
        sharedBufferUsage: number;
        avgQueryTime: number;
        slowQueries: number;
        deadlocks: number;
        rollbacks: number;
        transactions: {
            active: number;
            committed: number;
            rolledBack: number;
        };
        activeConnections: number;
        idleConnections: number;
        maxConnections: number;
        connectionUtilization: number;
        waitingQueries: number;
        timestamp: Date;
    }>;
    private gatherDatabaseMetrics;
    private getConnectionStats;
    private getPerformanceStats;
    private getCacheStats;
    private getTableStats;
    private saveMetrics;
    private checkThresholds;
    getDatabaseMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<DatabaseMetric[]>;
    getDatabaseAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        performance: {
            avgQueryTime: number;
            slowQueriesTotal: number;
            deadlocksTotal: number;
            queryTimeTrend: "increasing" | "decreasing" | "stable";
        };
        connections: {
            avgUtilization: number;
            peakUtilization: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        cache: {
            avgHitRatio: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        transactions: {
            totalCommitted: number;
            totalRolledBack: number;
            successRate: number;
        };
    }>;
    private calculateAverage;
    private calculateTransactionSuccessRate;
    private calculateTrend;
}
