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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const analytics_service_1 = require("./analytics.service");
const analytics_entity_1 = require("./entities/analytics.entity");
const create_analytics_dto_1 = require("./dto/create-analytics.dto");
const update_analytics_dto_1 = require("./dto/update-analytics.dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackEvent(createAnalyticsDto) {
        return this.analyticsService.trackEvent(createAnalyticsDto);
    }
    async findAll(startTime, endTime, type, category, userId) {
        return this.analyticsService.findByTimeRange(new Date(startTime), new Date(endTime), { type, category, userId });
    }
    async getUserAnalytics(userId, startTime, endTime) {
        const timeRange = startTime && endTime
            ? { start: new Date(startTime), end: new Date(endTime) }
            : undefined;
        return this.analyticsService.getUserAnalytics(userId, timeRange);
    }
    async getEventAnalytics(event, startTime, endTime) {
        const timeRange = startTime && endTime
            ? { start: new Date(startTime), end: new Date(endTime) }
            : undefined;
        return this.analyticsService.getEventAnalytics(event, timeRange);
    }
    async getAggregatedMetrics(groupBy, startTime, endTime, type, category) {
        return this.analyticsService.getAggregatedMetrics({
            groupBy,
            timeRange: {
                start: new Date(startTime),
                end: new Date(endTime)
            },
            type,
            category
        });
    }
    async getMetricsSummary(startTime, endTime) {
        return this.analyticsService.getMetricsSummary({
            start: new Date(startTime),
            end: new Date(endTime)
        });
    }
    async generateReport(startTime, endTime, type, category, groupBy, metrics) {
        return this.analyticsService.generateReport({
            timeRange: {
                start: new Date(startTime),
                end: new Date(endTime)
            },
            type,
            category,
            groupBy,
            metrics: metrics ? metrics.split(',') : undefined
        });
    }
    async update(id, updateAnalyticsDto) {
        return this.analyticsService.update(id, updateAnalyticsDto);
    }
    async remove(id) {
        return this.analyticsService.remove(id);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_analytics_dto_1.CreateAnalyticsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackEvent", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_a = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _a : Object, typeof (_b = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Get)('event/:event'),
    __param(0, (0, common_1.Param)('event')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getEventAnalytics", null);
__decorate([
    (0, common_1.Get)('metrics/aggregated'),
    __param(0, (0, common_1.Query)('groupBy')),
    __param(1, (0, common_1.Query)('startTime')),
    __param(2, (0, common_1.Query)('endTime')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, typeof (_c = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _c : Object, typeof (_d = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAggregatedMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/summary'),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMetricsSummary", null);
__decorate([
    (0, common_1.Get)('report'),
    __param(0, (0, common_1.Query)('startTime')),
    __param(1, (0, common_1.Query)('endTime')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('groupBy')),
    __param(5, (0, common_1.Query)('metrics')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_e = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _e : Object, typeof (_f = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _f : Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_analytics_dto_1.UpdateAnalyticsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "remove", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map