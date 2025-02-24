import { MonitoringService } from './monitoring.service';
import { PerformanceTrackingService } from './services/performance-tracking.service';
import { ErrorTrackingService } from './error-tracking.service';
import { ResourceMonitoringService } from './services/resource-monitoring.service';
import { NetworkMonitoringService } from './services/network-monitoring.service';
import { DatabaseMonitoringService } from './services/database-monitoring.service';
import { CacheMonitoringService } from './services/cache-monitoring.service';
export declare class MonitoringController {
    private readonly monitoringService;
    private readonly performanceService;
    private readonly errorTrackingService;
    private readonly resourceMonitoringService;
    private readonly networkMonitoringService;
    private readonly databaseMonitoringService;
    private readonly cacheMonitoringService;
    constructor(monitoringService: MonitoringService, performanceService: PerformanceTrackingService, errorTrackingService: ErrorTrackingService, resourceMonitoringService: ResourceMonitoringService, networkMonitoringService: NetworkMonitoringService, databaseMonitoringService: DatabaseMonitoringService, cacheMonitoringService: CacheMonitoringService);
    getHealth(): Promise<{
        status: "healthy" | "warning" | "critical";
        checks: Record<string, {
            status: string;
            message?: string;
        }>;
    }>;
    getMetrics(start?: string, end?: string): Promise<import("./entities/monitoring-metric.entity").MonitoringMetric[]>;
    getPerformanceMetrics(start?: string, end?: string): Promise<import("./entities/monitoring-metric.entity").MonitoringMetric[]>;
    getPerformanceAnalytics(start: string, end: string): Promise<{
        averageCpuUsage: number;
        averageMemoryUsage: number;
        maxCpuUsage: number;
        maxMemoryUsage: number;
        alertsCount: number;
        timeRange: {
            start: Date;
            end: Date;
        };
    }>;
    getAlerts(start?: string, end?: string): Promise<import("./entities/monitoring-metric.entity").MonitoringMetric[]>;
    getResourceMetrics(start?: string, end?: string): Promise<import("./entities/resource-metric.entity").ResourceMetric[]>;
    getResourceAnalytics(start: string, end: string): Promise<{
        averages: {
            cpu: number;
            memory: number;
            disk: number;
        };
        peaks: {
            cpu: number;
            memory: number;
            disk: number;
        };
        trends: {
            cpu: "increasing" | "decreasing" | "stable";
            memory: "increasing" | "decreasing" | "stable";
            disk: "increasing" | "decreasing" | "stable";
        };
        timeRange: {
            start: Date;
            end: Date;
        };
    }>;
    getCurrentResourceMetrics(): Promise<{
        timestamp: Date;
        cpu: number;
        memory: {
            used: number;
            total: number;
            percentage: number;
        };
        disk: {
            used: number;
            total: number;
            percentage: number;
        };
        network: {
            bytesIn: number;
            bytesOut: number;
        };
    }>;
    getNetworkMetrics(start?: string, end?: string): Promise<import("./entities/network-metric.entity").NetworkMetric[]>;
    getNetworkAnalytics(start: string, end: string): Promise<{
        latency: {
            average: number;
            max: number;
            min: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        packetLoss: {
            average: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        bandwidth: {
            averageUtilization: number;
            peakUtilization: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        errors: {
            total: number;
            trend: "increasing" | "decreasing" | "stable";
        };
    }>;
    getCurrentNetworkMetrics(): Promise<{
        bandwidth: {
            incoming: number;
            outgoing: number;
        };
        utilization: number;
        saturation: number;
        packetLoss: number;
        connectionStatus: string;
        activeConnections: number;
        connectionErrors: number;
        avgLatency: number;
        maxLatency: number;
        minLatency: number;
        jitter: number;
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
        errors: number;
        dropped: number;
        timestamp: Date;
    }>;
    getDatabaseMetrics(start?: string, end?: string): Promise<import("./entities/database-metric.entity").DatabaseMetric[]>;
    getDatabaseAnalytics(start: string, end: string): Promise<{
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
    getCurrentDatabaseMetrics(): Promise<{
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
    getCacheMetrics(start?: string, end?: string): Promise<import("./entities/cache-metric.entity").CacheMetric[]>;
    getCacheAnalytics(start: string, end: string): Promise<{
        redis: {
            performance: {
                avgHitRate: number;
                avgLatency: number;
                evictionRate: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            usage: {
                avgMemoryUsage: number;
                peakMemoryUsage: number;
                avgConnections: number;
            };
        };
        memcached: {
            performance: {
                avgHitRate: number;
                avgLatency: number;
                evictionRate: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            usage: {
                avgMemoryUsage: number;
                peakMemoryUsage: number;
                avgConnections: number;
            };
        };
        application: {
            routeCache: {
                avgHitRate: number;
                avgSize: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            dataCache: {
                avgHitRate: number;
                avgSize: number;
                trend: "increasing" | "decreasing" | "stable";
            };
            queryCache: {
                avgHitRate: number;
                avgSize: number;
                trend: "increasing" | "decreasing" | "stable";
            };
        };
    }>;
    getCurrentCacheMetrics(): Promise<{
        application: {
            routeCache: {
                hitRate: number;
                size: number;
                entries: number;
            };
            dataCache: {
                hitRate: number;
                size: number;
                entries: number;
            };
            queryCache: {
                hitRate: number;
                size: number;
                entries: number;
            };
        };
        memcached: {
            hitRate: number;
            missRate: number;
            memoryUsage: number;
            evictionCount: number;
            currentConnections: number;
            totalItems: number;
            getHits: number;
            getMisses: number;
            latency: number;
        };
        redis: {
            hitRate: number;
            missRate: number;
            memoryUsage: number;
            evictionCount: number;
            connectedClients: number;
            commandsProcessed: number;
            keyspaceHits: number;
            keyspaceMisses: number;
            latency: number;
        };
        timestamp: Date;
    }>;
    getTechnicalMetrics(start: string, end: string): Promise<any>;
    getBusinessMetrics(start: string, end: string): Promise<any>;
    getMetricsSummary(): Promise<any>;
}
