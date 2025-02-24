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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const monitoring_service_1 = require("./monitoring.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const performance_tracking_service_1 = require("./services/performance-tracking.service");
const error_tracking_service_1 = require("./error-tracking.service");
const resource_monitoring_service_1 = require("./services/resource-monitoring.service");
const network_monitoring_service_1 = require("./services/network-monitoring.service");
const database_monitoring_service_1 = require("./services/database-monitoring.service");
const cache_monitoring_service_1 = require("./services/cache-monitoring.service");
let MonitoringController = class MonitoringController {
    constructor(monitoringService, performanceService, errorTrackingService, resourceMonitoringService, networkMonitoringService, databaseMonitoringService, cacheMonitoringService) {
        this.monitoringService = monitoringService;
        this.performanceService = performanceService;
        this.errorTrackingService = errorTrackingService;
        this.resourceMonitoringService = resourceMonitoringService;
        this.networkMonitoringService = networkMonitoringService;
        this.databaseMonitoringService = databaseMonitoringService;
        this.cacheMonitoringService = cacheMonitoringService;
    }
    async getHealth() {
        return this.monitoringService.getSystemHealth();
    }
    async getMetrics(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.monitoringService.getMetrics(timeRange);
    }
    async getPerformanceMetrics(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.performanceService.getPerformanceMetrics(timeRange);
    }
    async getPerformanceAnalytics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.performanceService.getPerformanceAnalytics(timeRange);
    }
    async getAlerts(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.monitoringService.getAlerts(timeRange);
    }
    async getResourceMetrics(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.resourceMonitoringService.getResourceMetrics(timeRange);
    }
    async getResourceAnalytics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.resourceMonitoringService.getResourceAnalytics(timeRange);
    }
    async getCurrentResourceMetrics() {
        return this.resourceMonitoringService.collectMetrics();
    }
    async getNetworkMetrics(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.networkMonitoringService.getNetworkMetrics(timeRange);
    }
    async getNetworkAnalytics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.networkMonitoringService.getNetworkAnalytics(timeRange);
    }
    async getCurrentNetworkMetrics() {
        return this.networkMonitoringService.collectMetrics();
    }
    async getDatabaseMetrics(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.databaseMonitoringService.getDatabaseMetrics(timeRange);
    }
    async getDatabaseAnalytics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.databaseMonitoringService.getDatabaseAnalytics(timeRange);
    }
    async getCurrentDatabaseMetrics() {
        return this.databaseMonitoringService.collectMetrics();
    }
    async getCacheMetrics(start, end) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.cacheMonitoringService.getCacheMetrics(timeRange);
    }
    async getCacheAnalytics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.cacheMonitoringService.getCacheAnalytics(timeRange);
    }
    async getCurrentCacheMetrics() {
        return this.cacheMonitoringService.collectMetrics();
    }
    async getTechnicalMetrics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.monitoringService.getTechnicalMetrics(timeRange);
    }
    async getBusinessMetrics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.monitoringService.getBusinessMetrics(timeRange);
    }
    async getMetricsSummary() {
        return this.monitoringService.getMetricsSummary();
    }
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the current system health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns system metrics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns performance metrics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('performance/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns performance analytics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPerformanceAnalytics", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system alerts' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns system alerts for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('resources'),
    (0, swagger_1.ApiOperation)({ summary: 'Get resource metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns resource metrics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getResourceMetrics", null);
__decorate([
    (0, common_1.Get)('resources/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get resource analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns resource analytics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getResourceAnalytics", null);
__decorate([
    (0, common_1.Get)('resources/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current resource metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current resource metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCurrentResourceMetrics", null);
__decorate([
    (0, common_1.Get)('network'),
    (0, swagger_1.ApiOperation)({ summary: 'Get network metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns network metrics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getNetworkMetrics", null);
__decorate([
    (0, common_1.Get)('network/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get network analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns network analytics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getNetworkAnalytics", null);
__decorate([
    (0, common_1.Get)('network/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current network metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current network metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCurrentNetworkMetrics", null);
__decorate([
    (0, common_1.Get)('database'),
    (0, swagger_1.ApiOperation)({ summary: 'Get database metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns database metrics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDatabaseMetrics", null);
__decorate([
    (0, common_1.Get)('database/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get database analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns database analytics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getDatabaseAnalytics", null);
__decorate([
    (0, common_1.Get)('database/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current database metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current database metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCurrentDatabaseMetrics", null);
__decorate([
    (0, common_1.Get)('cache'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cache metrics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns cache metrics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCacheMetrics", null);
__decorate([
    (0, common_1.Get)('cache/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cache analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns cache analytics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCacheAnalytics", null);
__decorate([
    (0, common_1.Get)('cache/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current cache metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current cache metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getCurrentCacheMetrics", null);
__decorate([
    (0, common_1.Get)('technical'),
    (0, swagger_1.ApiOperation)({ summary: 'Get technical metrics for a time range' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Technical metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getTechnicalMetrics", null);
__decorate([
    (0, common_1.Get)('business'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business metrics for a time range' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String, description: 'Start date (ISO string)' }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String, description: 'End date (ISO string)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getBusinessMetrics", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest metrics summary' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metrics summary retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getMetricsSummary", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, swagger_1.ApiTags)('Monitoring'),
    (0, common_1.Controller)('monitoring'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService,
        performance_tracking_service_1.PerformanceTrackingService, typeof (_a = typeof error_tracking_service_1.ErrorTrackingService !== "undefined" && error_tracking_service_1.ErrorTrackingService) === "function" ? _a : Object, resource_monitoring_service_1.ResourceMonitoringService,
        network_monitoring_service_1.NetworkMonitoringService,
        database_monitoring_service_1.DatabaseMonitoringService,
        cache_monitoring_service_1.CacheMonitoringService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map