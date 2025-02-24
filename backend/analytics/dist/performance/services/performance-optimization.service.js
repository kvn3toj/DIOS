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
var PerformanceOptimizationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceOptimizationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../shared/services/redis.service");
const metrics_service_1 = require("../../services/metrics.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let PerformanceOptimizationService = PerformanceOptimizationService_1 = class PerformanceOptimizationService {
    constructor(configService, redisService, metricsService, eventEmitter) {
        this.configService = configService;
        this.redisService = redisService;
        this.metricsService = metricsService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PerformanceOptimizationService_1.name);
        this.metrics = new Map();
        this.resourceUsage = new Map();
        this.config = this.loadConfig();
        this.initializeMonitoring();
    }
    loadConfig() {
        return {
            caching: {
                enabled: this.configService.get('PERFORMANCE_CACHE_ENABLED') === 'true',
                ttl: parseInt(this.configService.get('PERFORMANCE_CACHE_TTL') || '3600'),
                maxItems: parseInt(this.configService.get('PERFORMANCE_CACHE_MAX_ITEMS') || '1000'),
            },
            compression: {
                enabled: this.configService.get('PERFORMANCE_COMPRESSION_ENABLED') === 'true',
                level: parseInt(this.configService.get('PERFORMANCE_COMPRESSION_LEVEL') || '6'),
                threshold: parseInt(this.configService.get('PERFORMANCE_COMPRESSION_THRESHOLD') || '1024'),
            },
            optimization: {
                minifyJs: this.configService.get('PERFORMANCE_MINIFY_JS') === 'true',
                minifyCss: this.configService.get('PERFORMANCE_MINIFY_CSS') === 'true',
                imageOptimization: this.configService.get('PERFORMANCE_IMAGE_OPTIMIZATION') === 'true',
                lazyLoading: this.configService.get('PERFORMANCE_LAZY_LOADING') === 'true',
            },
            monitoring: {
                enabled: this.configService.get('PERFORMANCE_MONITORING_ENABLED') === 'true',
                sampleRate: parseFloat(this.configService.get('PERFORMANCE_SAMPLE_RATE') || '0.1'),
                alertThresholds: {
                    responseTime: parseInt(this.configService.get('PERFORMANCE_ALERT_RESPONSE_TIME') || '1000'),
                    errorRate: parseFloat(this.configService.get('PERFORMANCE_ALERT_ERROR_RATE') || '0.05'),
                    memoryUsage: parseFloat(this.configService.get('PERFORMANCE_ALERT_MEMORY_USAGE') || '0.9'),
                },
            },
        };
    }
    initializeMonitoring() {
        if (!this.config.monitoring.enabled)
            return;
        setInterval(() => {
            this.collectSystemMetrics();
        }, 60000);
        this.eventEmitter.on('request.complete', (data) => {
            this.recordRequestMetrics(data);
        });
        this.eventEmitter.on('cache.operation', (data) => {
            this.recordCacheMetrics(data);
        });
    }
    async optimizeResponse(response, options = {}) {
        const startTime = Date.now();
        try {
            if (options.cache && this.config.caching.enabled) {
                const cached = await this.getCachedResponse(response);
                if (cached)
                    return cached;
            }
            if (options.compress && this.config.compression.enabled) {
                response = await this.compressResponse(response);
            }
            if (options.transform) {
                response = await this.transformResponse(response);
            }
            if (options.cache && this.config.caching.enabled) {
                await this.cacheResponse(response);
            }
            const duration = Date.now() - startTime;
            this.recordOptimizationMetrics(duration);
            return response;
        }
        catch (error) {
            this.logger.error('Response optimization failed:', error);
            throw error;
        }
    }
    async optimizeResources(resources) {
        if (!this.config.optimization.enabled)
            return resources;
        const optimizedResources = await Promise.all(resources.map(async (resource) => {
            switch (resource.type) {
                case 'javascript':
                    return this.config.optimization.minifyJs ?
                        await this.minifyJavaScript(resource) : resource;
                case 'css':
                    return this.config.optimization.minifyCss ?
                        await this.minifyCSS(resource) : resource;
                case 'image':
                    return this.config.optimization.imageOptimization ?
                        await this.optimizeImage(resource) : resource;
                default:
                    return resource;
            }
        }));
        return optimizedResources;
    }
    async getPerformanceMetrics(timeRange) {
        try {
            const metrics = await this.metricsService.getMetricsInRange('performance', timeRange);
            return this.aggregateMetrics(metrics);
        }
        catch (error) {
            this.logger.error('Failed to retrieve performance metrics:', error);
            throw error;
        }
    }
    async getCachedResponse(key) {
        try {
            const cached = await this.redisService.get(key);
            if (cached) {
                this.eventEmitter.emit('cache.operation', { type: 'hit', key });
                return JSON.parse(cached);
            }
            this.eventEmitter.emit('cache.operation', { type: 'miss', key });
            return null;
        }
        catch (error) {
            this.logger.error('Cache retrieval failed:', error);
            return null;
        }
    }
    async cacheResponse(key, value) {
        try {
            await this.redisService.set(key, JSON.stringify(value), this.config.caching.ttl);
            this.eventEmitter.emit('cache.operation', { type: 'set', key });
        }
        catch (error) {
            this.logger.error('Cache storage failed:', error);
        }
    }
    async compressResponse(response) {
        return response;
    }
    async transformResponse(response) {
        return response;
    }
    async minifyJavaScript(resource) {
        return resource;
    }
    async minifyCSS(resource) {
        return resource;
    }
    async optimizeImage(resource) {
        return resource;
    }
    collectSystemMetrics() {
        const metrics = {
            cpu: process.cpuUsage(),
            memory: process.memoryUsage(),
            resourceUsage: this.resourceUsage,
        };
        this.checkThresholds(metrics);
        this.eventEmitter.emit('system.metrics', metrics);
    }
    recordRequestMetrics(data) {
        const { duration, status, endpoint } = data;
        if (!this.metrics.has(endpoint)) {
            this.metrics.set(endpoint, this.createInitialMetrics());
        }
        const metrics = this.metrics.get(endpoint);
        this.updateMetrics(metrics, duration, status);
    }
    recordCacheMetrics(data) {
        const { type, key } = data;
    }
    recordOptimizationMetrics(duration) {
    }
    createInitialMetrics() {
        return {
            responseTime: { avg: 0, p95: 0, p99: 0 },
            throughput: { requestsPerSecond: 0, successRate: 0 },
            resources: { cpuUsage: 0, memoryUsage: 0, diskIO: 0 },
            caching: { hitRate: 0, missRate: 0, size: 0 },
        };
    }
    updateMetrics(metrics, duration, status) {
    }
    aggregateMetrics(metrics) {
        return metrics;
    }
    checkThresholds(metrics) {
        const { alertThresholds } = this.config.monitoring;
        if (metrics.responseTime > alertThresholds.responseTime) {
            this.emitAlert('High response time detected', metrics);
        }
        if (metrics.errorRate > alertThresholds.errorRate) {
            this.emitAlert('High error rate detected', metrics);
        }
        if (metrics.memoryUsage > alertThresholds.memoryUsage) {
            this.emitAlert('High memory usage detected', metrics);
        }
    }
    emitAlert(message, data) {
        this.eventEmitter.emit('performance.alert', {
            message,
            timestamp: new Date(),
            data,
        });
    }
};
exports.PerformanceOptimizationService = PerformanceOptimizationService;
exports.PerformanceOptimizationService = PerformanceOptimizationService = PerformanceOptimizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_service_1.RedisService,
        metrics_service_1.MetricsService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], PerformanceOptimizationService);
//# sourceMappingURL=performance-optimization.service.js.map