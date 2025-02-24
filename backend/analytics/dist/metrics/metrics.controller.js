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
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const metrics_service_1 = require("./metrics.service");
const system_metric_entity_1 = require("./entities/system-metric.entity");
const performance_metric_entity_1 = require("./entities/performance-metric.entity");
const resource_metric_entity_1 = require("./entities/resource-metric.entity");
let MetricsController = class MetricsController {
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    async recordSystemMetric(data) {
        return this.metricsService.recordSystemMetric(data);
    }
    async recordPerformanceMetric(data) {
        return this.metricsService.recordPerformanceMetric(data);
    }
    async recordResourceMetric(data) {
        return this.metricsService.recordResourceMetric(data);
    }
    async getSystemMetrics(startTime, endTime, type, service, instance) {
        return this.metricsService.getSystemMetrics({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            type,
            service,
            instance
        });
    }
    async getPerformanceMetrics(startTime, endTime, type, endpoint, method) {
        return this.metricsService.getPerformanceMetrics({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            type,
            endpoint,
            method
        });
    }
    async getResourceMetrics(startTime, endTime, resourceType, metricType, resourceName, region) {
        return this.metricsService.getResourceMetrics({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            resourceType,
            metricType,
            resourceName,
            region
        });
    }
    async getAggregatedMetrics(startTime, endTime, groupBy, type, filters) {
        return this.metricsService.getAggregatedMetrics({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            groupBy,
            type,
            filters: filters ? JSON.parse(filters) : undefined
        });
    }
    async getMetricsSummary(startTime, endTime) {
        return this.metricsService.getMetricsSummary({
            start: new Date(startTime),
            end: new Date(endTime)
        });
    }
    async generateReport(startTime, endTime, types, groupBy, filters) {
        return this.metricsService.generateReport({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            types: types.split(','),
            groupBy,
            filters: filters ? JSON.parse(filters) : undefined
        });
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Post)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Record a system metric' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: system_metric_entity_1.SystemMetricEntity }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "recordSystemMetric", null);
__decorate([
    (0, common_1.Post)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Record a performance metric' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: performance_metric_entity_1.PerformanceMetricEntity }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "recordPerformanceMetric", null);
__decorate([
    (0, common_1.Post)('resource'),
    (0, swagger_1.ApiOperation)({ summary: 'Record a resource metric' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: resource_metric_entity_1.ResourceMetricEntity }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "recordResourceMetric", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [system_metric_entity_1.SystemMetricEntity] }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('service')),
    __param(4, (0, common_1.Query)('instance')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getSystemMetrics", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [performance_metric_entity_1.PerformanceMetricEntity] }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('endpoint')),
    __param(4, (0, common_1.Query)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('resource'),
    (0, swagger_1.ApiOperation)({ summary: 'Get resource metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [resource_metric_entity_1.ResourceMetricEntity] }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('resourceType')),
    __param(3, (0, common_1.Query)('metricType')),
    __param(4, (0, common_1.Query)('resourceName')),
    __param(5, (0, common_1.Query)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getResourceMetrics", null);
__decorate([
    (0, common_1.Get)('aggregated'),
    (0, swagger_1.ApiOperation)({ summary: 'Get aggregated metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: 'object' }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('groupBy')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('filters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getAggregatedMetrics", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get metrics summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: 'object' }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getMetricsSummary", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate metrics report' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: 'object' }),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('types')),
    __param(3, (0, common_1.Query)('groupBy')),
    __param(4, (0, common_1.Query)('filters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "generateReport", null);
exports.MetricsController = MetricsController = __decorate([
    (0, swagger_1.ApiTags)('Metrics'),
    (0, common_1.Controller)('metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map