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
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const microservices_1 = require("@nestjs/microservices");
const system_metric_entity_1 = require("./entities/system-metric.entity");
const performance_metric_entity_1 = require("./entities/performance-metric.entity");
const resource_metric_entity_1 = require("./entities/resource-metric.entity");
const metrics_collector_service_1 = require("./services/metrics-collector.service");
const metrics_processor_service_1 = require("./services/metrics-processor.service");
const alerting_service_1 = require("./services/alerting.service");
let MetricsService = class MetricsService {
    constructor(systemMetricsRepository, performanceMetricsRepository, resourceMetricsRepository, messageQueue, metricsCollector, metricsProcessor, alertingService) {
        this.systemMetricsRepository = systemMetricsRepository;
        this.performanceMetricsRepository = performanceMetricsRepository;
        this.resourceMetricsRepository = resourceMetricsRepository;
        this.messageQueue = messageQueue;
        this.metricsCollector = metricsCollector;
        this.metricsProcessor = metricsProcessor;
        this.alertingService = alertingService;
    }
    async recordSystemMetric(data) {
        const metric = this.systemMetricsRepository.create({
            ...data,
            timestamp: new Date()
        });
        await this.systemMetricsRepository.save(metric);
        await this.messageQueue.emit('metrics.system_recorded', metric);
        await this.alertingService.checkSystemMetric(metric);
        return metric;
    }
    async recordPerformanceMetric(data) {
        const metric = this.performanceMetricsRepository.create({
            ...data,
            timestamp: new Date()
        });
        await this.performanceMetricsRepository.save(metric);
        await this.messageQueue.emit('metrics.performance_recorded', metric);
        await this.alertingService.checkPerformanceMetric(metric);
        return metric;
    }
    async recordResourceMetric(data) {
        const metric = this.resourceMetricsRepository.create({
            ...data,
            timestamp: new Date()
        });
        await this.resourceMetricsRepository.save(metric);
        await this.messageQueue.emit('metrics.resource_recorded', metric);
        await this.alertingService.checkResourceMetric(metric);
        return metric;
    }
    async getSystemMetrics(options) {
        const where = {
            timestamp: (0, typeorm_2.Between)(options.startTime, options.endTime)
        };
        if (options.type)
            where.type = options.type;
        if (options.service)
            where.service = options.service;
        if (options.instance)
            where.instance = options.instance;
        return this.systemMetricsRepository.find({
            where,
            order: { timestamp: 'DESC' }
        });
    }
    async getPerformanceMetrics(options) {
        const where = {
            timestamp: (0, typeorm_2.Between)(options.startTime, options.endTime)
        };
        if (options.type)
            where.type = options.type;
        if (options.endpoint)
            where.endpoint = options.endpoint;
        if (options.method)
            where.method = options.method;
        return this.performanceMetricsRepository.find({
            where,
            order: { timestamp: 'DESC' }
        });
    }
    async getResourceMetrics(options) {
        const where = {
            timestamp: (0, typeorm_2.Between)(options.startTime, options.endTime)
        };
        if (options.resourceType)
            where.resourceType = options.resourceType;
        if (options.metricType)
            where.metricType = options.metricType;
        if (options.resourceName)
            where.resourceName = options.resourceName;
        if (options.region)
            where.region = options.region;
        return this.resourceMetricsRepository.find({
            where,
            order: { timestamp: 'DESC' }
        });
    }
    async getAggregatedMetrics(options) {
        return this.metricsProcessor.getAggregatedMetrics(options);
    }
    async getMetricsSummary(timeRange) {
        return this.metricsProcessor.getMetricsSummary(timeRange);
    }
    async generateReport(options) {
        return this.metricsProcessor.generateReport(options);
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_metric_entity_1.SystemMetricEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(performance_metric_entity_1.PerformanceMetricEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(resource_metric_entity_1.ResourceMetricEntity)),
    __param(3, (0, common_1.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        microservices_1.ClientProxy, typeof (_a = typeof metrics_collector_service_1.MetricsCollectorService !== "undefined" && metrics_collector_service_1.MetricsCollectorService) === "function" ? _a : Object, typeof (_b = typeof metrics_processor_service_1.MetricsProcessorService !== "undefined" && metrics_processor_service_1.MetricsProcessorService) === "function" ? _b : Object, typeof (_c = typeof alerting_service_1.AlertingService !== "undefined" && alerting_service_1.AlertingService) === "function" ? _c : Object])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map