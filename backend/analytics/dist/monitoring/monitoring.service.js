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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const monitoring_metric_entity_1 = require("./entities/monitoring-metric.entity");
const os = require("os");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    constructor(metricRepository) {
        this.metricRepository = metricRepository;
        this.logger = new common_1.Logger(MonitoringService_1.name);
        this.updateInterval = 60000;
        this.alertThresholds = {
            cpu: 80,
            memory: 85,
            processMemory: 1024 * 1024 * 1024,
            errorRate: 5
        };
        this.startMonitoring();
    }
    startMonitoring() {
        setInterval(async () => {
            await this.collectMetrics();
        }, this.updateInterval);
    }
    async collectMetrics() {
        try {
            const metrics = await this.gatherSystemMetrics();
            await this.saveMetrics(metrics);
            await this.checkAlerts(metrics);
        }
        catch (error) {
            this.logger.error(`Error collecting metrics: ${error.message}`, error.stack);
        }
    }
    async gatherSystemMetrics() {
        const cpuUsage = await this.getCPUUsage();
        const memoryMetrics = this.getMemoryMetrics();
        const processMetrics = this.getProcessMetrics();
        const systemMetrics = this.getSystemMetrics();
        return {
            cpu: {
                usage: cpuUsage,
                cores: os.cpus().length,
                loadAverage: os.loadavg()
            },
            memory: memoryMetrics,
            process: processMetrics,
            system: systemMetrics,
            status: 'healthy',
            timestamp: new Date()
        };
    }
    async getCPUUsage() {
        const cpus = os.cpus();
        const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const totalTick = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0), 0);
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        return Math.round(((total - idle) / total) * 100);
    }
    getMemoryMetrics() {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        return {
            total: totalMemory,
            free: freeMemory,
            used: usedMemory,
            usagePercentage: Math.round((usedMemory / totalMemory) * 100)
        };
    }
    getProcessMetrics() {
        const memoryUsage = process.memoryUsage();
        return {
            uptime: process.uptime(),
            pid: process.pid,
            memory: {
                heapTotal: memoryUsage.heapTotal,
                heapUsed: memoryUsage.heapUsed,
                rss: memoryUsage.rss,
                external: memoryUsage.external
            },
            cpuUsage: process.cpuUsage()
        };
    }
    getSystemMetrics() {
        return {
            platform: process.platform,
            arch: process.arch,
            version: process.version,
            uptime: os.uptime(),
            hostname: os.hostname(),
            networkInterfaces: os.networkInterfaces()
        };
    }
    async saveMetrics(metrics) {
        try {
            const monitoringMetric = this.metricRepository.create(metrics);
            await this.metricRepository.save(monitoringMetric);
        }
        catch (error) {
            this.logger.error(`Error saving metrics: ${error.message}`, error.stack);
        }
    }
    async checkAlerts(metrics) {
        const alerts = [];
        if (metrics.cpu.usage > this.alertThresholds.cpu) {
            alerts.push({
                type: 'cpu',
                severity: 'high',
                message: `High CPU usage: ${metrics.cpu.usage}%`,
                timestamp: new Date()
            });
        }
        if (metrics.memory.usagePercentage > this.alertThresholds.memory) {
            alerts.push({
                type: 'memory',
                severity: 'high',
                message: `High memory usage: ${metrics.memory.usagePercentage}%`,
                timestamp: new Date()
            });
        }
        if (metrics.process.memory.heapUsed > this.alertThresholds.processMemory) {
            alerts.push({
                type: 'process',
                severity: 'high',
                message: `High process memory usage: ${Math.round(metrics.process.memory.heapUsed / 1024 / 1024)}MB`,
                timestamp: new Date()
            });
        }
        if (alerts.length > 0) {
            this.logger.warn(`System alerts detected: ${alerts.length}`);
            await this.saveAlerts(alerts);
        }
    }
    async saveAlerts(alerts) {
        try {
            const metric = this.metricRepository.create({
                type: 'alert',
                alerts,
                timestamp: new Date()
            });
            await this.metricRepository.save(metric);
        }
        catch (error) {
            this.logger.error(`Error saving alerts: ${error.message}`, error.stack);
        }
    }
    async getMetrics(timeRange) {
        try {
            const query = this.metricRepository.createQueryBuilder('metric');
            if (timeRange) {
                query.where('metric.timestamp BETWEEN :start AND :end', {
                    start: timeRange.start,
                    end: timeRange.end
                });
            }
            query.orderBy('metric.timestamp', 'DESC');
            if (!timeRange) {
                query.limit(100);
            }
            return await query.getMany();
        }
        catch (error) {
            this.logger.error(`Error fetching metrics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getAggregatedMetrics(options) {
        try {
            const { groupBy, timeRange } = options;
            const query = this.metricRepository.createQueryBuilder('metric');
            let groupByFormat;
            switch (groupBy) {
                case 'hour':
                    groupByFormat = 'YYYY-MM-DD HH24';
                    break;
                case 'day':
                    groupByFormat = 'YYYY-MM-DD';
                    break;
                case 'week':
                    groupByFormat = 'YYYY-WW';
                    break;
            }
            return await query
                .select([
                `TO_CHAR(metric.timestamp, :groupByFormat) as time_group`,
                'AVG(metric.cpu->\'usage\') as cpu_usage',
                'AVG((metric.memory->\'used\')::float / (metric.memory->\'total\')::float * 100) as memory_usage',
                'COUNT(CASE WHEN metric.type = \'alert\' THEN 1 END) as alert_count'
            ])
                .where('metric.timestamp BETWEEN :start AND :end', {
                start: timeRange.start,
                end: timeRange.end,
                groupByFormat
            })
                .groupBy('time_group')
                .orderBy('time_group', 'ASC')
                .getRawMany();
        }
        catch (error) {
            this.logger.error(`Error fetching aggregated metrics: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getAlerts(timeRange) {
        try {
            const query = this.metricRepository
                .createQueryBuilder('metric')
                .where('metric.type = :type', { type: 'alert' });
            if (timeRange) {
                query.andWhere('metric.timestamp BETWEEN :start AND :end', {
                    start: timeRange.start,
                    end: timeRange.end
                });
            }
            query.orderBy('metric.timestamp', 'DESC');
            return await query.getMany();
        }
        catch (error) {
            this.logger.error(`Error fetching alerts: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSystemHealth() {
        try {
            const metrics = await this.gatherSystemMetrics();
            const checks = {
                cpu: {
                    status: metrics.cpu.usage > this.alertThresholds.cpu ? 'critical' :
                        metrics.cpu.usage > this.alertThresholds.cpu * 0.8 ? 'warning' : 'healthy',
                    message: `CPU Usage: ${metrics.cpu.usage}%`
                },
                memory: {
                    status: metrics.memory.usagePercentage > this.alertThresholds.memory ? 'critical' :
                        metrics.memory.usagePercentage > this.alertThresholds.memory * 0.8 ? 'warning' : 'healthy',
                    message: `Memory Usage: ${metrics.memory.usagePercentage}%`
                },
                process: {
                    status: metrics.process.memory.heapUsed > this.alertThresholds.processMemory ? 'critical' :
                        metrics.process.memory.heapUsed > this.alertThresholds.processMemory * 0.8 ? 'warning' : 'healthy',
                    message: `Process Memory: ${Math.round(metrics.process.memory.heapUsed / 1024 / 1024)}MB`
                },
                uptime: {
                    status: 'healthy',
                    message: `Uptime: ${Math.round(metrics.process.uptime / 3600)}h`
                }
            };
            const status = Object.values(checks).some(check => check.status === 'critical') ? 'critical' :
                Object.values(checks).some(check => check.status === 'warning') ? 'warning' : 'healthy';
            return { status, checks };
        }
        catch (error) {
            this.logger.error(`Error checking system health: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(monitoring_metric_entity_1.MonitoringMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map