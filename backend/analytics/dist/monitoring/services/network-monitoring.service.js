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
var NetworkMonitoringService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const os = require("os");
const network_metric_entity_1 = require("../entities/network-metric.entity");
let NetworkMonitoringService = NetworkMonitoringService_1 = class NetworkMonitoringService {
    constructor(networkMetricRepository, eventEmitter) {
        this.networkMetricRepository = networkMetricRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NetworkMonitoringService_1.name);
        this.updateInterval = 60000;
        this.thresholds = {
            latency: {
                warning: 100,
                critical: 200,
            },
            packetLoss: {
                warning: 1,
                critical: 5,
            },
            bandwidth: {
                warning: 80,
                critical: 90,
            },
            errorRate: {
                warning: 1,
                critical: 2,
            },
        };
        this.startNetworkMonitoring();
    }
    startNetworkMonitoring() {
        setInterval(() => {
            this.collectMetrics().catch(err => this.logger.error('Failed to collect network metrics:', err));
        }, this.updateInterval);
    }
    async collectMetrics() {
        const metrics = await this.gatherNetworkMetrics();
        await this.saveMetrics(metrics);
        await this.checkThresholds(metrics);
        return metrics;
    }
    async gatherNetworkMetrics() {
        const networkStats = await this.getNetworkStats();
        const latencyStats = await this.getLatencyStats();
        const connectivityStats = await this.getConnectivityStats();
        const throughputStats = await this.getThroughputStats();
        return {
            timestamp: new Date(),
            ...networkStats,
            ...latencyStats,
            ...connectivityStats,
            ...throughputStats,
        };
    }
    async getNetworkStats() {
        const interfaces = os.networkInterfaces();
        const stats = {
            bytesIn: 0,
            bytesOut: 0,
            packetsIn: 0,
            packetsOut: 0,
            errors: 0,
            dropped: 0,
        };
        Object.values(interfaces).forEach(iface => {
            if (iface) {
                iface.forEach(details => {
                    if (details.family === 'IPv4') {
                        stats.bytesIn += Math.random() * 1000000;
                        stats.bytesOut += Math.random() * 1000000;
                        stats.packetsIn += Math.random() * 1000;
                        stats.packetsOut += Math.random() * 1000;
                        stats.errors += Math.random() * 10;
                        stats.dropped += Math.random() * 10;
                    }
                });
            }
        });
        return stats;
    }
    async getLatencyStats() {
        return {
            avgLatency: Math.random() * 100,
            maxLatency: Math.random() * 200,
            minLatency: Math.random() * 20,
            jitter: Math.random() * 10,
        };
    }
    async getConnectivityStats() {
        return {
            packetLoss: Math.random() * 2,
            connectionStatus: 'connected',
            activeConnections: Math.floor(Math.random() * 1000),
            connectionErrors: Math.floor(Math.random() * 10),
        };
    }
    async getThroughputStats() {
        return {
            bandwidth: {
                incoming: Math.random() * 100000000,
                outgoing: Math.random() * 100000000,
            },
            utilization: Math.random() * 100,
            saturation: Math.random() * 100,
        };
    }
    async saveMetrics(metrics) {
        try {
            const networkMetric = this.networkMetricRepository.create(metrics);
            await this.networkMetricRepository.save(networkMetric);
        }
        catch (error) {
            this.logger.error('Failed to save network metrics:', error);
            throw error;
        }
    }
    async checkThresholds(metrics) {
        const alerts = [];
        if (metrics.avgLatency > this.thresholds.latency.critical) {
            alerts.push({
                type: 'latency',
                severity: 'critical',
                message: `High latency detected: ${metrics.avgLatency}ms`,
            });
        }
        else if (metrics.avgLatency > this.thresholds.latency.warning) {
            alerts.push({
                type: 'latency',
                severity: 'warning',
                message: `Elevated latency detected: ${metrics.avgLatency}ms`,
            });
        }
        if (metrics.packetLoss > this.thresholds.packetLoss.critical) {
            alerts.push({
                type: 'packet_loss',
                severity: 'critical',
                message: `High packet loss detected: ${metrics.packetLoss}%`,
            });
        }
        else if (metrics.packetLoss > this.thresholds.packetLoss.warning) {
            alerts.push({
                type: 'packet_loss',
                severity: 'warning',
                message: `Elevated packet loss detected: ${metrics.packetLoss}%`,
            });
        }
        if (metrics.utilization > this.thresholds.bandwidth.critical) {
            alerts.push({
                type: 'bandwidth',
                severity: 'critical',
                message: `High bandwidth utilization: ${metrics.utilization}%`,
            });
        }
        else if (metrics.utilization > this.thresholds.bandwidth.warning) {
            alerts.push({
                type: 'bandwidth',
                severity: 'warning',
                message: `Elevated bandwidth utilization: ${metrics.utilization}%`,
            });
        }
        alerts.forEach(alert => {
            this.eventEmitter.emit('network.alert', alert);
        });
        return alerts;
    }
    async getNetworkMetrics(timeRange) {
        const query = this.networkMetricRepository.createQueryBuilder('metric');
        if (timeRange) {
            query.where('metric.timestamp BETWEEN :start AND :end', {
                start: timeRange.start,
                end: timeRange.end,
            });
        }
        return query.orderBy('metric.timestamp', 'DESC').getMany();
    }
    async getNetworkAnalytics(timeRange) {
        const metrics = await this.getNetworkMetrics(timeRange);
        return {
            latency: {
                average: this.calculateAverage(metrics.map(m => m.avgLatency)),
                max: Math.max(...metrics.map(m => m.maxLatency)),
                min: Math.min(...metrics.map(m => m.minLatency)),
                trend: this.calculateTrend(metrics.map(m => ({ value: m.avgLatency, timestamp: m.timestamp }))),
            },
            packetLoss: {
                average: this.calculateAverage(metrics.map(m => m.packetLoss)),
                trend: this.calculateTrend(metrics.map(m => ({ value: m.packetLoss, timestamp: m.timestamp }))),
            },
            bandwidth: {
                averageUtilization: this.calculateAverage(metrics.map(m => m.utilization)),
                peakUtilization: Math.max(...metrics.map(m => m.utilization)),
                trend: this.calculateTrend(metrics.map(m => ({ value: m.utilization, timestamp: m.timestamp }))),
            },
            errors: {
                total: metrics.reduce((sum, m) => sum + m.connectionErrors, 0),
                trend: this.calculateTrend(metrics.map(m => ({ value: m.connectionErrors, timestamp: m.timestamp }))),
            },
        };
    }
    calculateAverage(values) {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
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
exports.NetworkMonitoringService = NetworkMonitoringService;
exports.NetworkMonitoringService = NetworkMonitoringService = NetworkMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(network_metric_entity_1.NetworkMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], NetworkMonitoringService);
//# sourceMappingURL=network-monitoring.service.js.map