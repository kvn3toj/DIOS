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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const microservices_1 = require("@nestjs/microservices");
const analytics_entity_1 = require("./entities/analytics.entity");
const real_time_analytics_service_1 = require("./services/real-time-analytics.service");
const batch_analytics_service_1 = require("./services/batch-analytics.service");
const aggregation_service_1 = require("./services/aggregation.service");
let AnalyticsService = class AnalyticsService {
    constructor(analyticsRepository, messageQueue, realTimeAnalytics, batchAnalytics, aggregationService) {
        this.analyticsRepository = analyticsRepository;
        this.messageQueue = messageQueue;
        this.realTimeAnalytics = realTimeAnalytics;
        this.batchAnalytics = batchAnalytics;
        this.aggregationService = aggregationService;
    }
    async trackEvent(data) {
        const analytics = this.analyticsRepository.create({
            ...data,
            timestamp: new Date()
        });
        await this.analyticsRepository.save(analytics);
        await this.messageQueue.emit('analytics.event_tracked', analytics);
        await this.realTimeAnalytics.processEvent(analytics);
        return analytics;
    }
    async findByTimeRange(startTime, endTime, filters) {
        const where = {
            timestamp: (0, typeorm_2.Between)(startTime, endTime),
            ...filters
        };
        return this.analyticsRepository.find({
            where,
            order: { timestamp: 'DESC' }
        });
    }
    async getAggregatedMetrics(options) {
        return this.aggregationService.getAggregatedMetrics(options);
    }
    async getUserAnalytics(userId, timeRange) {
        const where = { userId };
        if (timeRange) {
            where.timestamp = (0, typeorm_2.Between)(timeRange.start, timeRange.end);
        }
        return this.analyticsRepository.find({
            where,
            order: { timestamp: 'DESC' }
        });
    }
    async getEventAnalytics(event, timeRange) {
        const where = { event };
        if (timeRange) {
            where.timestamp = (0, typeorm_2.Between)(timeRange.start, timeRange.end);
        }
        return this.analyticsRepository.find({
            where,
            order: { timestamp: 'DESC' }
        });
    }
    async update(id, updateAnalyticsDto) {
        await this.analyticsRepository.update(id, updateAnalyticsDto);
        return this.analyticsRepository.findOne({ where: { id } });
    }
    async remove(id) {
        const result = await this.analyticsRepository.delete(id);
        return result.affected > 0;
    }
    async getMetricsSummary(timeRange) {
        return this.batchAnalytics.getMetricsSummary(timeRange);
    }
    async generateReport(options) {
        return this.batchAnalytics.generateReport(options);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_entity_1.AnalyticsEntity)),
    __param(1, (0, common_1.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        microservices_1.ClientProxy, typeof (_a = typeof real_time_analytics_service_1.RealTimeAnalyticsService !== "undefined" && real_time_analytics_service_1.RealTimeAnalyticsService) === "function" ? _a : Object, typeof (_b = typeof batch_analytics_service_1.BatchAnalyticsService !== "undefined" && batch_analytics_service_1.BatchAnalyticsService) === "function" ? _b : Object, typeof (_c = typeof aggregation_service_1.AggregationService !== "undefined" && aggregation_service_1.AggregationService) === "function" ? _c : Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map