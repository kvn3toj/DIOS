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
exports.AnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const analytics_entity_1 = require("./entities/analytics.entity");
const create_analytics_dto_1 = require("./dto/create-analytics.dto");
const update_analytics_dto_1 = require("./dto/update-analytics.dto");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
let AnalyticsResolver = class AnalyticsResolver {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackAnalytics(createAnalyticsDto) {
        return this.analyticsService.trackEvent(createAnalyticsDto);
    }
    async analytics(startTime, endTime, type, category, userId) {
        return this.analyticsService.findByTimeRange(startTime, endTime, { type, category, userId });
    }
    async userAnalytics(userId, startTime, endTime) {
        const timeRange = startTime && endTime ? { start: startTime, end: endTime } : undefined;
        return this.analyticsService.getUserAnalytics(userId, timeRange);
    }
    async eventAnalytics(event, startTime, endTime) {
        const timeRange = startTime && endTime ? { start: startTime, end: endTime } : undefined;
        return this.analyticsService.getEventAnalytics(event, timeRange);
    }
    async aggregatedMetrics(groupBy, startTime, endTime, type, category) {
        return this.analyticsService.getAggregatedMetrics({
            groupBy,
            timeRange: { start: startTime, end: endTime },
            type,
            category
        });
    }
    async metricsSummary(startTime, endTime) {
        return this.analyticsService.getMetricsSummary({ start: startTime, end: endTime });
    }
    async analyticsReport(startTime, endTime, type, category, groupBy, metrics) {
        return this.analyticsService.generateReport({
            timeRange: { start: startTime, end: endTime },
            type,
            category,
            groupBy,
            metrics
        });
    }
    async updateAnalytics(id, updateAnalyticsDto) {
        return this.analyticsService.update(id, updateAnalyticsDto);
    }
    async removeAnalytics(id) {
        return this.analyticsService.remove(id);
    }
};
exports.AnalyticsResolver = AnalyticsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => analytics_entity_1.AnalyticsEntity),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_analytics_dto_1.CreateAnalyticsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "trackAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_entity_1.AnalyticsEntity]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('type', { nullable: true })),
    __param(3, (0, graphql_1.Args)('category', { nullable: true })),
    __param(4, (0, graphql_1.Args)('userId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, typeof (_a = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _a : Object, typeof (_b = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _b : Object, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analytics", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_entity_1.AnalyticsEntity]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('userId')),
    __param(1, (0, graphql_1.Args)('startTime', { nullable: true })),
    __param(2, (0, graphql_1.Args)('endTime', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "userAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => [analytics_entity_1.AnalyticsEntity]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('event')),
    __param(1, (0, graphql_1.Args)('startTime', { nullable: true })),
    __param(2, (0, graphql_1.Args)('endTime', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "eventAnalytics", null);
__decorate([
    (0, graphql_1.Query)(() => JSON),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('groupBy')),
    __param(1, (0, graphql_1.Args)('startTime')),
    __param(2, (0, graphql_1.Args)('endTime')),
    __param(3, (0, graphql_1.Args)('type', { nullable: true })),
    __param(4, (0, graphql_1.Args)('category', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date, typeof (_c = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _c : Object, typeof (_d = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "aggregatedMetrics", null);
__decorate([
    (0, graphql_1.Query)(() => JSON),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "metricsSummary", null);
__decorate([
    (0, graphql_1.Query)(() => JSON),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('startTime')),
    __param(1, (0, graphql_1.Args)('endTime')),
    __param(2, (0, graphql_1.Args)('type', { nullable: true })),
    __param(3, (0, graphql_1.Args)('category', { nullable: true })),
    __param(4, (0, graphql_1.Args)('groupBy', { nullable: true })),
    __param(5, (0, graphql_1.Args)('metrics', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date, typeof (_e = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _e : Object, typeof (_f = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _f : Object, String, Array]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "analyticsReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => analytics_entity_1.AnalyticsEntity),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_analytics_dto_1.UpdateAnalyticsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "updateAnalytics", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "removeAnalytics", null);
exports.AnalyticsResolver = AnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(() => analytics_entity_1.AnalyticsEntity),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsResolver);
//# sourceMappingURL=analytics.resolver.js.map