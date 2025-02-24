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
var ResourceMonitoringService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const os = require("os");
const fs = require("fs/promises");
const resource_metric_entity_1 = require("../entities/resource-metric.entity");
let ResourceMonitoringService = ResourceMonitoringService_1 = class ResourceMonitoringService {
    constructor(resourceMetricRepository, eventEmitter) {
        this.resourceMetricRepository = resourceMetricRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(ResourceMonitoringService_1.name);
        this.thresholds = {
            cpu: {
                target: 60,
                warning: 70,
                critical: 80
            },
            memory: {
                target: 70,
                warning: 80,
                critical: 85
            },
            disk: {
                target: 70,
                warning: 80,
                critical: 90
            }
        };
        this.startResourceMonitoring();
    }
    startResourceMonitoring() {
        setInterval(() => {
            this.collectMetrics().catch(err => this.logger.error('Error collecting metrics:', err));
        }, 300000);
    }
    async collectMetrics() {
        const metrics = await this.gatherResourceMetrics();
        await this.saveMetrics(metrics);
        await this.checkThresholds(metrics);
        return metrics;
    }
    async gatherResourceMetrics() {
        const cpuUsage = await this.getCPUUsage();
        const memoryUsage = this.getMemoryUsage();
        const diskUsage = await this.getDiskUsage();
        const networkStats = await this.getNetworkStats();
        return {
            timestamp: new Date(),
            cpu: cpuUsage,
            memory: memoryUsage,
            disk: diskUsage,
            network: networkStats
        };
    }
    async getCPUUsage() {
        const cpus = os.cpus();
        const totalCPU = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total) * 100;
        }, 0);
        return totalCPU / cpus.length;
    }
    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        const percentage = (used / total) * 100;
        return { used, total, percentage };
    }
    async getDiskUsage() {
        try {
            const stats = await fs.stat('/');
            const total = stats.size;
            const used = total - stats.blocks;
            const percentage = (used / total) * 100;
            return { used, total, percentage };
        }
        catch (error) {
            this.logger.error('Error getting disk usage:', error);
            return { used: 0, total: 0, percentage: 0 };
        }
    }
    async getNetworkStats() {
        const networkInterfaces = os.networkInterfaces();
        let bytesIn = 0;
        let bytesOut = 0;
        Object.values(networkInterfaces).forEach(interfaces => {
            interfaces?.forEach(iface => {
                if (!iface.internal) {
                    bytesIn += iface.internal ? 0 : 1000;
                    bytesOut += iface.internal ? 0 : 1000;
                }
            });
        });
        return { bytesIn, bytesOut };
    }
    async saveMetrics(metrics) {
        const resourceMetric = this.resourceMetricRepository.create({
            timestamp: metrics.timestamp,
            cpuUsage: metrics.cpu,
            memoryUsed: metrics.memory.used,
            memoryTotal: metrics.memory.total,
            memoryPercentage: metrics.memory.percentage,
            diskUsed: metrics.disk.used,
            diskTotal: metrics.disk.total,
            diskPercentage: metrics.disk.percentage,
            networkBytesIn: metrics.network.bytesIn,
            networkBytesOut: metrics.network.bytesOut
        });
        await this.resourceMetricRepository.save(resourceMetric);
    }
    async checkThresholds(metrics) {
        if (metrics.cpu >= this.thresholds.cpu.critical) {
            this.eventEmitter.emit('resource.cpu.critical', {
                value: metrics.cpu,
                threshold: this.thresholds.cpu.critical,
                timestamp: metrics.timestamp
            });
        }
        else if (metrics.cpu >= this.thresholds.cpu.warning) {
            this.eventEmitter.emit('resource.cpu.warning', {
                value: metrics.cpu,
                threshold: this.thresholds.cpu.warning,
                timestamp: metrics.timestamp
            });
        }
        if (metrics.memory.percentage >= this.thresholds.memory.critical) {
            this.eventEmitter.emit('resource.memory.critical', {
                value: metrics.memory.percentage,
                threshold: this.thresholds.memory.critical,
                timestamp: metrics.timestamp
            });
        }
        else if (metrics.memory.percentage >= this.thresholds.memory.warning) {
            this.eventEmitter.emit('resource.memory.warning', {
                value: metrics.memory.percentage,
                threshold: this.thresholds.memory.warning,
                timestamp: metrics.timestamp
            });
        }
        if (metrics.disk.percentage >= this.thresholds.disk.critical) {
            this.eventEmitter.emit('resource.disk.critical', {
                value: metrics.disk.percentage,
                threshold: this.thresholds.disk.critical,
                timestamp: metrics.timestamp
            });
        }
        else if (metrics.disk.percentage >= this.thresholds.disk.warning) {
            this.eventEmitter.emit('resource.disk.warning', {
                value: metrics.disk.percentage,
                threshold: this.thresholds.disk.warning,
                timestamp: metrics.timestamp
            });
        }
    }
    async getResourceMetrics(timeRange) {
        const query = this.resourceMetricRepository.createQueryBuilder('metric');
        if (timeRange) {
            query.where('metric.timestamp BETWEEN :start AND :end', {
                start: timeRange.start,
                end: timeRange.end
            });
        }
        return query.orderBy('metric.timestamp', 'DESC').getMany();
    }
    async getResourceAnalytics(timeRange) {
        const metrics = await this.getResourceMetrics(timeRange);
        return {
            averages: {
                cpu: this.calculateAverage(metrics.map(m => m.cpuUsage)),
                memory: this.calculateAverage(metrics.map(m => m.memoryPercentage)),
                disk: this.calculateAverage(metrics.map(m => m.diskPercentage))
            },
            peaks: {
                cpu: Math.max(...metrics.map(m => m.cpuUsage)),
                memory: Math.max(...metrics.map(m => m.memoryPercentage)),
                disk: Math.max(...metrics.map(m => m.diskPercentage))
            },
            trends: {
                cpu: this.calculateTrend(metrics.map(m => ({ value: m.cpuUsage, timestamp: m.timestamp }))),
                memory: this.calculateTrend(metrics.map(m => ({ value: m.memoryPercentage, timestamp: m.timestamp }))),
                disk: this.calculateTrend(metrics.map(m => ({ value: m.diskPercentage, timestamp: m.timestamp })))
            },
            timeRange
        };
    }
    calculateAverage(values) {
        return values.reduce((a, b) => a + b, 0) / values.length;
    }
    calculateTrend(data) {
        if (data.length < 2)
            return 'stable';
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        const firstAvg = this.calculateAverage(firstHalf.map(d => d.value));
        const secondAvg = this.calculateAverage(secondHalf.map(d => d.value));
        const difference = secondAvg - firstAvg;
        if (difference > 1)
            return 'increasing';
        if (difference < -1)
            return 'decreasing';
        return 'stable';
    }
};
exports.ResourceMonitoringService = ResourceMonitoringService;
exports.ResourceMonitoringService = ResourceMonitoringService = ResourceMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resource_metric_entity_1.ResourceMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], ResourceMonitoringService);
//# sourceMappingURL=resource-monitoring.service.js.map