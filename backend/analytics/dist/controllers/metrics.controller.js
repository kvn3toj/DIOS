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
var MetricsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const metrics_service_1 = require("../services/metrics.service");
let MetricsController = MetricsController_1 = class MetricsController {
    constructor(metricsService) {
        this.metricsService = metricsService;
        this.logger = new common_1.Logger(MetricsController_1.name);
    }
    async getPerformanceMetrics() {
        try {
            const metrics = await this.metricsService.collectPerformanceMetrics();
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error('Failed to get performance metrics:', error);
            throw error;
        }
    }
    async getQualityMetrics() {
        try {
            const metrics = await this.metricsService.collectQualityMetrics();
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error('Failed to get quality metrics:', error);
            throw error;
        }
    }
    async getEngagementMetrics() {
        try {
            const metrics = await this.metricsService.collectEngagementMetrics();
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error('Failed to get engagement metrics:', error);
            throw error;
        }
    }
    async getMonetizationMetrics() {
        try {
            const metrics = await this.metricsService.collectMonetizationMetrics();
            return {
                success: true,
                data: metrics,
            };
        }
        catch (error) {
            this.logger.error('Failed to get monetization metrics:', error);
            throw error;
        }
    }
    async getDashboardMetrics() {
        try {
            const [performance, quality, engagement, monetization] = await Promise.all([
                this.metricsService.collectPerformanceMetrics(),
                this.metricsService.collectQualityMetrics(),
                this.metricsService.collectEngagementMetrics(),
                this.metricsService.collectMonetizationMetrics(),
            ]);
            return {
                success: true,
                data: {
                    performance,
                    quality,
                    engagement,
                    monetization,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get dashboard metrics:', error);
            throw error;
        }
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)('performance'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'metrics', action: 'read' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Get)('quality'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'metrics', action: 'read' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getQualityMetrics", null);
__decorate([
    (0, common_1.Get)('engagement'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'metrics', action: 'read' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getEngagementMetrics", null);
__decorate([
    (0, common_1.Get)('monetization'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'metrics', action: 'read' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getMonetizationMetrics", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'metrics', action: 'read' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getDashboardMetrics", null);
exports.MetricsController = MetricsController = MetricsController_1 = __decorate([
    (0, common_1.Controller)('metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map