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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("../analytics/analytics.service");
const chart_service_1 = require("./services/chart.service");
const widget_service_1 = require("./services/widget.service");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
let DashboardService = class DashboardService {
    constructor(analyticsService, chartService, widgetService) {
        this.analyticsService = analyticsService;
        this.chartService = chartService;
        this.widgetService = widgetService;
    }
    async getDashboardData(timeRange) {
        const [userMetrics, systemMetrics, performanceMetrics, eventDistribution] = await Promise.all([
            this.getUserMetrics(timeRange),
            this.getSystemMetrics(timeRange),
            this.getPerformanceMetrics(timeRange),
            this.getEventDistribution(timeRange)
        ]);
        return {
            userMetrics,
            systemMetrics,
            performanceMetrics,
            eventDistribution
        };
    }
    async getUserMetrics(timeRange) {
        const data = await this.analyticsService.getAggregatedMetrics({
            groupBy: 'day',
            timeRange,
            type: analytics_entity_1.AnalyticsType.USER
        });
        return this.chartService.generateTimeSeriesChart({
            data,
            title: 'User Activity',
            xAxis: 'Date',
            yAxis: 'Number of Events'
        });
    }
    async getSystemMetrics(timeRange) {
        const data = await this.analyticsService.getAggregatedMetrics({
            groupBy: 'hour',
            timeRange,
            type: analytics_entity_1.AnalyticsType.SYSTEM
        });
        return this.chartService.generateTimeSeriesChart({
            data,
            title: 'System Events',
            xAxis: 'Time',
            yAxis: 'Event Count'
        });
    }
    async getPerformanceMetrics(timeRange) {
        const data = await this.analyticsService.getAggregatedMetrics({
            groupBy: 'hour',
            timeRange,
            type: analytics_entity_1.AnalyticsType.PERFORMANCE
        });
        return this.chartService.generatePerformanceChart({
            data,
            title: 'System Performance',
            metrics: ['responseTime', 'cpuUsage', 'memoryUsage']
        });
    }
    async getEventDistribution(timeRange) {
        const data = await this.analyticsService.getAggregatedMetrics({
            groupBy: 'day',
            timeRange
        });
        return this.chartService.generatePieChart({
            data,
            title: 'Event Distribution by Type',
            categories: Object.values(analytics_entity_1.AnalyticsType)
        });
    }
    async getCustomWidget(options) {
        const data = await this.analyticsService.getAggregatedMetrics({
            groupBy: options.groupBy || 'day',
            timeRange: options.timeRange,
            metrics: options.metrics
        });
        return this.widgetService.generateWidget({
            type: options.type,
            data,
            title: `Custom ${options.type} Widget`
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        chart_service_1.ChartService, typeof (_a = typeof widget_service_1.WidgetService !== "undefined" && widget_service_1.WidgetService) === "function" ? _a : Object])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map