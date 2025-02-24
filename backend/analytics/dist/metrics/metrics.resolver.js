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
exports.MetricsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const metrics_service_1 = require("./metrics.service");
const system_metric_entity_1 = require("./entities/system-metric.entity");
const performance_metric_entity_1 = require("./entities/performance-metric.entity");
const resource_metric_entity_1 = require("./entities/resource-metric.entity");
let MetricsResolver = class MetricsResolver {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async recordSystemMetric(type, service, instance, value, metadata, tags) {
        return this.metricsService.recordSystemMetric({
            type,
            service,
            instance,
            value,
            metadata,
            tags
        });
    }
    async recordPerformanceMetric(type, endpoint, method, value, count, metadata, breakdown) {
        return this.metricsService.recordPerformanceMetric({
            type,
            endpoint,
            method,
            value,
            count,
            metadata,
            breakdown
        });
    }
    async recordResourceMetric(resourceType, metricType, resourceName, region, value, metadata, status) {
        return this.metricsService.recordResourceMetric({
            resourceType,
            metricType,
            resourceName,
            region,
            value,
            metadata,
            status
        });
    }
    async systemMetrics(startTime, endTime, type, service, instance) {
        return this.metricsService.getSystemMetrics({
            startTime,
            endTime,
            type,
            service,
            instance
        });
    }
    async performanceMetrics(startTime, endTime, type, endpoint, method) {
        return this.metricsService.getPerformanceMetrics({
            startTime,
            endTime,
            type,
            endpoint,
            method
        });
    }
    async resourceMetrics(startTime, endTime, resourceType, metricType, resourceName, region) {
        return this.metricsService.getResourceMetrics({
            startTime,
            endTime,
            resourceType,
            metricType,
            resourceName,
            region
        });
    }
    async aggregatedMetrics(startTime, endTime, groupBy, type, filters) {
        return this.metricsService.getAggregatedMetrics({
            startTime,
            endTime,
            groupBy,
            type,
            filters
        });
    }
    async metricsSummary(startTime, endTime) {
        return this.metricsService.getMetricsSummary({
            start: startTime,
            end: endTime
        });
    }
    async metricsReport(startTime, endTime, types, groupBy, filters) {
        return this.metricsService.generateReport({
            startTime,
            endTime,
            types,
            groupBy,
            filters
        });
    }
};
exports.MetricsResolver = MetricsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => system_metric_entity_1.SystemMetricEntity),
    __param(0, (0, graphql_1.Args)('type')),
    __param(1, (0, graphql_1.Args)('service')),
    __param(2, (0, graphql_1.Args)('instance')),
    __param(3, (0, graphql_1.Args)('value')),
    __param(4, (0, graphql_1.Args)('metadata')),
    __param(5, (0, graphql_1.Args)('tags', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "recordSystemMetric", null);
__decorate([
    (0, graphql_1.Mutation)(() => performance_metric_entity_1.PerformanceMetricEntity),
    __param(0, (0, graphql_1.Args)('type')),
    __param(1, (0, graphql_1.Args)('endpoint')),
    __param(2, (0, graphql_1.Args)('method')),
    __param(3, (0, graphql_1.Args)('value')),
    __param(4, (0, graphql_1.Args)('count', { nullable: true })),
    __param(5, (0, graphql_1.Args)('metadata')),
    __param(6, (0, graphql_1.Args)('breakdown', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "recordPerformanceMetric", null);
__decorate([
    (0, graphql_1.Mutation)(() => resource_metric_entity_1.ResourceMetricEntity),
    __param(0, (0, graphql_1.Args)('resourceType')),
    __param(1, (0, graphql_1.Args)('metricType')),
    __param(2, (0, graphql_1.Args)('resourceName')),
    __param(3, (0, graphql_1.Args)('region', { nullable: true })),
    __param(4, (0, graphql_1.Args)('value')),
    __param(5, (0, graphql_1.Args)('metadata')),
    __param(6, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "recordResourceMetric", null);
__decorate([
    (0, graphql_1.Query)(() => [system_metric_entity_1.SystemMetricEntity]),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('type', { nullable: true })),
    __param(3, (0, graphql_1.Args)('service', { nullable: true })),
    __param(4, (0, graphql_1.Args)('instance', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "systemMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => [performance_metric_entity_1.PerformanceMetricEntity]),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('type', { nullable: true })),
    __param(3, (0, graphql_1.Args)('endpoint', { nullable: true })),
    __param(4, (0, graphql_1.Args)('method', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "performanceMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => [resource_metric_entity_1.ResourceMetricEntity]),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('resourceType', { nullable: true })),
    __param(3, (0, graphql_1.Args)('metricType', { nullable: true })),
    __param(4, (0, graphql_1.Args)('resourceName', { nullable: true })),
    __param(5, (0, graphql_1.Args)('region', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "resourceMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => [JSON]),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('groupBy')),
    __param(3, (0, graphql_1.Args)('type')),
    __param(4, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, String, String, Object]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "aggregatedMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => JSON),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "metricsSummary", null);
__decorate([
    (0, graphql_1.Query)(() => JSON),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('types', { type: () => [String] })),
    __param(3, (0, graphql_1.Args)('groupBy', { nullable: true })),
    __param(4, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, Array, String, Object]),
    __metadata("design:returntype", Promise)
], MetricsResolver.prototype, "metricsReport", null);
exports.MetricsResolver = MetricsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsResolver);
//# sourceMappingURL=metrics.resolver.js.map