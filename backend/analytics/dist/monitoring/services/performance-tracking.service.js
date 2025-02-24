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
var PerformanceTrackingService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceTrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const monitoring_metric_entity_1 = require("../entities/monitoring-metric.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const os = require("os");
let PerformanceTrackingService = PerformanceTrackingService_1 = class PerformanceTrackingService {
    constructor(metricRepository, eventEmitter) {
        this.metricRepository = metricRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PerformanceTrackingService_1.name);
        this.updateInterval = 30000;
        this.performanceThresholds = {
            cpu: {
                warning: 70,
                critical: 85
            },
            memory: {
                warning: 75,
                critical: 90
            },
            responseTime: {
                warning: 1000,
                critical: 3000
            },
            errorRate: {
                warning: 1,
                critical: 5
            }
        };
        this.startPerformanceTracking();
    }
    startPerformanceTracking() {
        setInterval(() => {
            this.trackPerformanceMetrics().catch(err => this.logger.error('Error tracking performance metrics:', err));
        }, this.updateInterval);
    }
    async trackPerformanceMetrics() {
        const metrics = await this.collectPerformanceMetrics();
        await this.savePerformanceMetrics(metrics);
        await this.analyzePerformance(metrics);
        return metrics;
    }
    async collectPerformanceMetrics() {
        const cpuUsage = await this.getCPUMetrics();
        const memoryMetrics = this.getMemoryMetrics();
        const processMetrics = this.getProcessMetrics();
        const networkMetrics = this.getNetworkMetrics();
        return {
            timestamp: new Date(),
            cpu: cpuUsage,
            memory: memoryMetrics,
            process: processMetrics,
            network: networkMetrics,
            type: 'performance'
        };
    }
    async getCPUMetrics() {
        const cpus = os.cpus();
        const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const totalTick = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0), 0);
        const usage = ((totalTick - totalIdle) / totalTick) * 100;
        return {
            usage,
            cores: cpus.length,
            loadAverage: os.loadavg(),
            model: cpus[0].model,
            speed: cpus[0].speed
        };
    }
    getMemoryMetrics() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        const usagePercentage = (used / total) * 100;
        return {
            total,
            free,
            used,
            usagePercentage
        };
    }
    getProcessMetrics() {
        const { heapTotal, heapUsed, external, rss } = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
            uptime: process.uptime(),
            pid: process.pid,
            memory: {
                heapTotal,
                heapUsed,
                external,
                rss
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            }
        };
    }
    getNetworkMetrics() {
        const networkInterfaces = os.networkInterfaces();
        const connections = Object.entries(networkInterfaces).reduce((acc, [name, interfaces]) => {
            acc[name] = interfaces.map(iface => ({
                address: iface.address,
                netmask: iface.netmask,
                family: iface.family,
                mac: iface.mac,
                internal: iface.internal
            }));
            return acc;
        }, {});
        return {
            interfaces: connections,
            timestamp: new Date()
        };
    }
    async savePerformanceMetrics(metrics) {
        try {
            const monitoringMetric = this.metricRepository.create({
                ...metrics,
                status: this.determineStatus(metrics)
            });
            await this.metricRepository.save(monitoringMetric);
        }
        catch (error) {
            this.logger.error('Error saving performance metrics:', error);
            throw error;
        }
    }
    determineStatus(metrics) {
        if (metrics.cpu.usage >= this.performanceThresholds.cpu.critical ||
            metrics.memory.usagePercentage >= this.performanceThresholds.memory.critical) {
            return 'critical';
        }
        if (metrics.cpu.usage >= this.performanceThresholds.cpu.warning ||
            metrics.memory.usagePercentage >= this.performanceThresholds.memory.warning) {
            return 'warning';
        }
        return 'healthy';
    }
    async analyzePerformance(metrics) {
        const status = this.determineStatus(metrics);
        if (status !== 'healthy') {
            const alerts = this.generateAlerts(metrics, status);
            this.eventEmitter.emit('performance.alert', alerts);
        }
        this.eventEmitter.emit('performance.metrics', metrics);
    }
    generateAlerts(metrics, status) {
        const alerts = [];
        if (metrics.cpu.usage >= this.performanceThresholds.cpu[status]) {
            alerts.push({
                type: 'CPU',
                severity: status,
                message: `CPU usage is at ${metrics.cpu.usage.toFixed(2)}%`,
                timestamp: new Date()
            });
        }
        if (metrics.memory.usagePercentage >= this.performanceThresholds.memory[status]) {
            alerts.push({
                type: 'Memory',
                severity: status,
                message: `Memory usage is at ${metrics.memory.usagePercentage.toFixed(2)}%`,
                timestamp: new Date()
            });
        }
        return alerts;
    }
    async getPerformanceMetrics(timeRange) {
        const query = this.metricRepository.createQueryBuilder('metric')
            .where('metric.type = :type', { type: 'performance' });
        if (timeRange) {
            query.andWhere('metric.timestamp BETWEEN :start AND :end', {
                start: timeRange.start,
                end: timeRange.end
            });
        }
        return query.orderBy('metric.timestamp', 'DESC').getMany();
    }
    async getPerformanceAnalytics(timeRange) {
        const metrics = await this.getPerformanceMetrics(timeRange);
        return {
            averageCpuUsage: this.calculateAverage(metrics.map(m => m.cpu.usage)),
            averageMemoryUsage: this.calculateAverage(metrics.map(m => m.memory.usagePercentage)),
            maxCpuUsage: Math.max(...metrics.map(m => m.cpu.usage)),
            maxMemoryUsage: Math.max(...metrics.map(m => m.memory.usagePercentage)),
            alertsCount: metrics.filter(m => m.status !== 'healthy').length,
            timeRange
        };
    }
    calculateAverage(values) {
        return values.length > 0
            ? values.reduce((acc, val) => acc + val, 0) / values.length
            : 0;
    }
};
exports.PerformanceTrackingService = PerformanceTrackingService;
exports.PerformanceTrackingService = PerformanceTrackingService = PerformanceTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(monitoring_metric_entity_1.MonitoringMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], PerformanceTrackingService);
//# sourceMappingURL=performance-tracking.service.js.map