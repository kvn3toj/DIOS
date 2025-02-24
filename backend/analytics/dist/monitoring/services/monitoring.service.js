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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const technical_metric_entity_1 = require("../entities/technical-metric.entity");
const business_metric_entity_1 = require("../entities/business-metric.entity");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    constructor(technicalMetricRepository, businessMetricRepository, eventEmitter) {
        this.technicalMetricRepository = technicalMetricRepository;
        this.businessMetricRepository = businessMetricRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(MonitoringService_1.name);
        this.updateInterval = 60000;
        this.technicalThresholds = {
            response: {
                warning: 150,
                critical: 250,
            },
            availability: {
                target: 99.9,
                warning: 99.5,
            },
            cpu: {
                target: 60,
                warning: 80,
            },
            memory: {
                target: 70,
                warning: 85,
            },
            errorRate: {
                target: 0.1,
                warning: 0.5,
            },
        };
        this.businessThresholds = {
            dau: {
                target: 10000,
                warning: 8000,
            },
            retention: {
                d1: { target: 40, warning: 35 },
                d7: { target: 20, warning: 15 },
                d30: { target: 10, warning: 8 },
            },
            revenue: {
                daily: { target: 5000, warning: 4000 },
                arpu: { target: 2.5, warning: 2.0 },
            },
            conversion: {
                rate: { target: 5, warning: 4 },
            },
        };
        this.startMonitoring();
    }
    startMonitoring() {
        setInterval(() => {
            this.collectMetrics();
        }, this.updateInterval);
    }
    async collectMetrics() {
        try {
            const technicalMetrics = await this.collectTechnicalMetrics();
            const businessMetrics = await this.collectBusinessMetrics();
            await this.saveTechnicalMetrics(technicalMetrics);
            await this.saveBusinessMetrics(businessMetrics);
            this.checkThresholds(technicalMetrics, businessMetrics);
        }
        catch (error) {
            this.logger.error('Error collecting metrics', error);
            this.eventEmitter.emit('monitoring.error', error);
        }
    }
    async collectTechnicalMetrics() {
        const performance = await this.getPerformanceMetrics();
        const availability = await this.getAvailabilityMetrics();
        const resources = await this.getResourceMetrics();
        const errors = await this.getErrorMetrics();
        return {
            performance,
            availability,
            resources,
            errors,
            timestamp: new Date(),
        };
    }
    async collectBusinessMetrics() {
        const engagement = await this.getEngagementMetrics();
        const monetization = await this.getMonetizationMetrics();
        const conversion = await this.getConversionMetrics();
        return {
            engagement,
            monetization,
            conversion,
            timestamp: new Date(),
        };
    }
    async getPerformanceMetrics() {
        return {
            responseTime: {
                p50: 0,
                p95: 0,
                p99: 0,
            },
        };
    }
    async getAvailabilityMetrics() {
        return {
            uptime: 0,
            reliability: 0,
        };
    }
    async getResourceMetrics() {
        return {
            cpu: {
                usage: 0,
                average: 0,
            },
            memory: {
                usage: 0,
                average: 0,
            },
        };
    }
    async getErrorMetrics() {
        return {
            rate: 0,
            distribution: {},
        };
    }
    async getEngagementMetrics() {
        return {
            dau: 0,
            wau: 0,
            mau: 0,
            retention: {
                d1: 0,
                d7: 0,
                d30: 0,
            },
        };
    }
    async getMonetizationMetrics() {
        return {
            revenue: {
                daily: 0,
                arpu: 0,
                ltv: 0,
            },
        };
    }
    async getConversionMetrics() {
        return {
            rate: 0,
            value: 0,
        };
    }
    async saveTechnicalMetrics(metrics) {
        const technicalMetric = this.technicalMetricRepository.create(metrics);
        await this.technicalMetricRepository.save(technicalMetric);
    }
    async saveBusinessMetrics(metrics) {
        const businessMetric = this.businessMetricRepository.create(metrics);
        await this.businessMetricRepository.save(businessMetric);
    }
    checkThresholds(technicalMetrics, businessMetrics) {
        this.checkTechnicalThresholds(technicalMetrics);
        this.checkBusinessThresholds(businessMetrics);
    }
    checkTechnicalThresholds(metrics) {
        if (metrics.performance.responseTime.p95 > this.technicalThresholds.response.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'technical',
                metric: 'response_time',
                value: metrics.performance.responseTime.p95,
                threshold: this.technicalThresholds.response.warning,
                severity: metrics.performance.responseTime.p95 > this.technicalThresholds.response.critical ? 'critical' : 'warning',
            });
        }
        if (metrics.resources.cpu.usage > this.technicalThresholds.cpu.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'technical',
                metric: 'cpu_usage',
                value: metrics.resources.cpu.usage,
                threshold: this.technicalThresholds.cpu.warning,
                severity: 'warning',
            });
        }
        if (metrics.resources.memory.usage > this.technicalThresholds.memory.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'technical',
                metric: 'memory_usage',
                value: metrics.resources.memory.usage,
                threshold: this.technicalThresholds.memory.warning,
                severity: 'warning',
            });
        }
        if (metrics.errors.rate > this.technicalThresholds.errorRate.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'technical',
                metric: 'error_rate',
                value: metrics.errors.rate,
                threshold: this.technicalThresholds.errorRate.warning,
                severity: 'warning',
            });
        }
    }
    checkBusinessThresholds(metrics) {
        if (metrics.engagement.dau < this.businessThresholds.dau.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'business',
                metric: 'dau',
                value: metrics.engagement.dau,
                threshold: this.businessThresholds.dau.warning,
                severity: 'warning',
            });
        }
        Object.entries(metrics.engagement.retention).forEach(([period, value]) => {
            if (value < this.businessThresholds.retention[period].warning) {
                this.eventEmitter.emit('monitoring.alert', {
                    type: 'business',
                    metric: `retention_${period}`,
                    value: value,
                    threshold: this.businessThresholds.retention[period].warning,
                    severity: 'warning',
                });
            }
        });
        if (metrics.monetization.revenue.daily < this.businessThresholds.revenue.daily.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'business',
                metric: 'daily_revenue',
                value: metrics.monetization.revenue.daily,
                threshold: this.businessThresholds.revenue.daily.warning,
                severity: 'warning',
            });
        }
        if (metrics.conversion.rate < this.businessThresholds.conversion.rate.warning) {
            this.eventEmitter.emit('monitoring.alert', {
                type: 'business',
                metric: 'conversion_rate',
                value: metrics.conversion.rate,
                threshold: this.businessThresholds.conversion.rate.warning,
                severity: 'warning',
            });
        }
    }
    async getTechnicalMetrics(timeRange) {
        return this.technicalMetricRepository.find({
            where: {
                timestamp: {
                    $gte: timeRange.start,
                    $lte: timeRange.end,
                },
            },
            order: {
                timestamp: 'ASC',
            },
        });
    }
    async getBusinessMetrics(timeRange) {
        return this.businessMetricRepository.find({
            where: {
                timestamp: {
                    $gte: timeRange.start,
                    $lte: timeRange.end,
                },
            },
            order: {
                timestamp: 'ASC',
            },
        });
    }
    async getMetricsSummary() {
        const latestTechnical = await this.technicalMetricRepository.findOne({
            order: {
                timestamp: 'DESC',
            },
        });
        const latestBusiness = await this.businessMetricRepository.findOne({
            order: {
                timestamp: 'DESC',
            },
        });
        return {
            technical: latestTechnical,
            business: latestBusiness,
        };
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(technical_metric_entity_1.TechnicalMetric)),
    __param(1, (0, typeorm_1.InjectRepository)(business_metric_entity_1.BusinessMetric)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map