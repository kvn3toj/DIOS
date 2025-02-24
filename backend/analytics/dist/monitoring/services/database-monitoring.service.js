"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DatabaseMonitoringService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const database_metric_entity_1 = require("../entities/database-metric.entity");
let DatabaseMonitoringService = DatabaseMonitoringService_1 = class DatabaseMonitoringService {
    constructor(databaseMetricRepository, connection, eventEmitter) {
        this.databaseMetricRepository = databaseMetricRepository;
        this.connection = connection;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(DatabaseMonitoringService_1.name);
        this.updateInterval = 60000;
        this.thresholds = {
            queryTime: {
                warning: 1000,
                critical: 3000,
            },
            connections: {
                warning: 80,
                critical: 90,
            },
            deadlocks: {
                warning: 5,
                critical: 10,
            },
            cacheHitRatio: {
                warning: 85,
                critical: 75,
            },
        };
        this.startDatabaseMonitoring();
    }
    startDatabaseMonitoring() {
        setInterval(() => {
            this.collectMetrics().catch(err => this.logger.error('Failed to collect database metrics:', err));
        }, this.updateInterval);
    }
    async collectMetrics() {
        const metrics = await this.gatherDatabaseMetrics();
        await this.saveMetrics(metrics);
        await this.checkThresholds(metrics);
        return metrics;
    }
    async gatherDatabaseMetrics() {
        const queryRunner = this.connection.createQueryRunner();
        try {
            await queryRunner.connect();
            const [connectionStats, performanceStats, cacheStats, tableStats] = await Promise.all([
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
        }
        finally {
            await queryRunner.release();
        }
    }
    async getConnectionStats(queryRunner) {
        return {
            activeConnections: Math.floor(Math.random() * 100),
            idleConnections: Math.floor(Math.random() * 50),
            maxConnections: 100,
            connectionUtilization: Math.random() * 100,
            waitingQueries: Math.floor(Math.random() * 10),
        };
    }
    async getPerformanceStats(queryRunner) {
        return {
            avgQueryTime: Math.random() * 1000,
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
    async getCacheStats(queryRunner) {
        return {
            cacheHitRatio: Math.random() * 100,
            indexHitRatio: Math.random() * 100,
            bufferCacheHitRatio: Math.random() * 100,
            sharedBufferUsage: Math.random() * 100,
        };
    }
    async getTableStats(queryRunner) {
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
    async saveMetrics(metrics) {
        try {
            const databaseMetric = this.databaseMetricRepository.create(metrics);
            await this.databaseMetricRepository.save(databaseMetric);
        }
        catch (error) {
            this.logger.error('Failed to save database metrics:', error);
            throw error;
        }
    }
    async checkThresholds(metrics) {
        const alerts = [];
        if (metrics.avgQueryTime > this.thresholds.queryTime.critical) {
            alerts.push({
                type: 'query_time',
                severity: 'critical',
                message: `High average query time: ${metrics.avgQueryTime}ms`,
            });
        }
        else if (metrics.avgQueryTime > this.thresholds.queryTime.warning) {
            alerts.push({
                type: 'query_time',
                severity: 'warning',
                message: `Elevated average query time: ${metrics.avgQueryTime}ms`,
            });
        }
        const connectionPercentage = (metrics.activeConnections / metrics.maxConnections) * 100;
        if (connectionPercentage > this.thresholds.connections.critical) {
            alerts.push({
                type: 'connections',
                severity: 'critical',
                message: `High connection utilization: ${connectionPercentage}%`,
            });
        }
        else if (connectionPercentage > this.thresholds.connections.warning) {
            alerts.push({
                type: 'connections',
                severity: 'warning',
                message: `Elevated connection utilization: ${connectionPercentage}%`,
            });
        }
        if (metrics.deadlocks > this.thresholds.deadlocks.critical) {
            alerts.push({
                type: 'deadlocks',
                severity: 'critical',
                message: `High number of deadlocks: ${metrics.deadlocks}`,
            });
        }
        else if (metrics.deadlocks > this.thresholds.deadlocks.warning) {
            alerts.push({
                type: 'deadlocks',
                severity: 'warning',
                message: `Elevated number of deadlocks: ${metrics.deadlocks}`,
            });
        }
        if (metrics.cacheHitRatio < this.thresholds.cacheHitRatio.critical) {
            alerts.push({
                type: 'cache_hit_ratio',
                severity: 'critical',
                message: `Low cache hit ratio: ${metrics.cacheHitRatio}%`,
            });
        }
        else if (metrics.cacheHitRatio < this.thresholds.cacheHitRatio.warning) {
            alerts.push({
                type: 'cache_hit_ratio',
                severity: 'warning',
                message: `Suboptimal cache hit ratio: ${metrics.cacheHitRatio}%`,
            });
        }
        alerts.forEach(alert => {
            this.eventEmitter.emit('database.alert', alert);
        });
        return alerts;
    }
    async getDatabaseMetrics(timeRange) {
        const query = this.databaseMetricRepository.createQueryBuilder('metric');
        if (timeRange) {
            query.where('metric.timestamp BETWEEN :start AND :end', {
                start: timeRange.start,
                end: timeRange.end,
            });
        }
        return query.orderBy('metric.timestamp', 'DESC').getMany();
    }
    async getDatabaseAnalytics(timeRange) {
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
    calculateAverage(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
    calculateTransactionSuccessRate(metrics) {
        const totalCommitted = metrics.reduce((sum, m) => sum + m.transactions.committed, 0);
        const totalRolledBack = metrics.reduce((sum, m) => sum + m.transactions.rolledBack, 0);
        const total = totalCommitted + totalRolledBack;
        return total > 0 ? (totalCommitted / total) * 100 : 100;
    }
    calculateTrend(data) {
        if (data.length < 2)
            return 'stable';
        const values = data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
            .map(d => d.value);
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);
        const threshold = 0.1;
        if (secondAvg > firstAvg * (1 + threshold))
            return 'increasing';
        if (secondAvg < firstAvg * (1 - threshold))
            return 'decreasing';
        return 'stable';
    }
};
exports.DatabaseMonitoringService = DatabaseMonitoringService;
exports.DatabaseMonitoringService = DatabaseMonitoringService = DatabaseMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_metric_entity_1.DatabaseMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Connection, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], DatabaseMonitoringService);
//# sourceMappingURL=database-monitoring.service.js.map