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
var MetricsService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let MetricsService = MetricsService_1 = class MetricsService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(MetricsService_1.name);
    }
    async collectPerformanceMetrics() {
        try {
            const responseTimes = await this.prisma.$queryRaw `
        SELECT 
          percentile_cont(0.50) WITHIN GROUP (ORDER BY response_time) as p50,
          percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time) as p95,
          percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time) as p99
        FROM request_logs
        WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      `;
            const availability = await this.prisma.$queryRaw `
        SELECT 
          (successful_requests::float / total_requests) * 100 as uptime,
          (successful_operations::float / total_operations) * 100 as reliability
        FROM system_health
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;
            const resources = await this.prisma.$queryRaw `
        SELECT 
          AVG(cpu_usage) as cpu,
          AVG(memory_usage) as memory
        FROM resource_metrics
        WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      `;
            return {
                response: responseTimes[0],
                availability: availability[0],
                resources: resources[0]
            };
        }
        catch (error) {
            this.logger.error('Failed to collect performance metrics:', error);
            throw error;
        }
    }
    async collectQualityMetrics() {
        try {
            const errors = await this.prisma.$queryRaw `
        SELECT 
          (error_count::float / total_requests) * 100 as rate,
          error_distribution
        FROM error_metrics
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;
            const testing = await this.prisma.$queryRaw `
        SELECT 
          coverage_percentage as coverage,
          success_rate as success
        FROM test_metrics
        ORDER BY timestamp DESC
        LIMIT 1
      `;
            return {
                errors: errors[0],
                testing: testing[0]
            };
        }
        catch (error) {
            this.logger.error('Failed to collect quality metrics:', error);
            throw error;
        }
    }
    async collectEngagementMetrics() {
        try {
            const activeUsers = await this.prisma.$queryRaw `
        SELECT 
          COUNT(DISTINCT CASE WHEN last_active >= NOW() - INTERVAL '24 hours' THEN id END) as daily,
          COUNT(DISTINCT CASE WHEN last_active >= NOW() - INTERVAL '7 days' THEN id END) as weekly,
          COUNT(DISTINCT CASE WHEN last_active >= NOW() - INTERVAL '30 days' THEN id END) as monthly
        FROM users
      `;
            const retention = await this.prisma.$queryRaw `
        SELECT 
          (d1_retained::float / total_users) * 100 as d1,
          (d7_retained::float / total_users) * 100 as d7,
          (d30_retained::float / total_users) * 100 as d30
        FROM user_retention
        WHERE cohort_date >= NOW() - INTERVAL '30 days'
      `;
            return {
                users: {
                    active: activeUsers[0],
                    retention: retention[0]
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to collect engagement metrics:', error);
            throw error;
        }
    }
    async collectMonetizationMetrics() {
        try {
            const revenue = await this.prisma.$queryRaw `
        SELECT 
          SUM(amount) as daily,
          AVG(amount) as arpu,
          SUM(amount) / COUNT(DISTINCT user_id) as ltv
        FROM transactions
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;
            const conversion = await this.prisma.$queryRaw `
        SELECT 
          (converted_users::float / total_users) * 100 as rate,
          AVG(conversion_value) as value
        FROM conversion_metrics
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
      `;
            return {
                revenue: revenue[0],
                conversion: conversion[0]
            };
        }
        catch (error) {
            this.logger.error('Failed to collect monetization metrics:', error);
            throw error;
        }
    }
    async checkAlertThresholds(metrics) {
        try {
            const thresholds = await this.prisma.alertThresholds.findMany({
                where: { active: true }
            });
            for (const threshold of thresholds) {
                const value = this.getMetricValue(metrics, threshold.metricPath);
                if (this.isThresholdExceeded(value, threshold)) {
                    await this.triggerAlert(threshold, value);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to check alert thresholds:', error);
            throw error;
        }
    }
    getMetricValue(metrics, path) {
        return path.split('.').reduce((obj, key) => obj[key], metrics);
    }
    isThresholdExceeded(value, threshold) {
        switch (threshold.operator) {
            case '>':
                return value > threshold.value;
            case '<':
                return value < threshold.value;
            case '>=':
                return value >= threshold.value;
            case '<=':
                return value <= threshold.value;
            default:
                return false;
        }
    }
    async triggerAlert(threshold, value) {
        const alert = {
            metricName: threshold.metricPath,
            threshold: threshold.value,
            actualValue: value,
            timestamp: new Date(),
            severity: threshold.severity
        };
        await this.prisma.alerts.create({ data: alert });
        this.eventEmitter.emit('alert.triggered', alert);
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = MetricsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map