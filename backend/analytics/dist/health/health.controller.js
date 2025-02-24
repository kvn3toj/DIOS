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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let HealthController = class HealthController {
    constructor(health, db, memory, disk, defaultConnection) {
        this.health = health;
        this.db = db;
        this.memory = memory;
        this.disk = disk;
        this.defaultConnection = defaultConnection;
    }
    check() {
        return this.health.check([
            () => this.db.pingCheck('database', { connection: this.defaultConnection }),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', {
                thresholdPercent: 0.9,
                path: '/'
            }),
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
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getMetrics", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __param(4, (0, typeorm_1.InjectConnection)()),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        terminus_1.TypeOrmHealthIndicator,
        terminus_1.MemoryHealthIndicator,
        terminus_1.DiskHealthIndicator,
        typeorm_2.Connection])
], HealthController);
//# sourceMappingURL=health.controller.js.map