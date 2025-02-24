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
var PerformanceMiddleware_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMiddleware = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const performance_optimization_service_1 = require("../services/performance-optimization.service");
let PerformanceMiddleware = PerformanceMiddleware_1 = class PerformanceMiddleware {
    constructor(performanceService, eventEmitter) {
        this.performanceService = performanceService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PerformanceMiddleware_1.name);
        this.requestTimes = new Map();
        this.requestSizes = new Map();
    }
    use(req, res, next) {
        const requestId = req.headers['x-request-id'] || Date.now().toString();
        const startTime = process.hrtime();
        this.requestSizes.set(requestId, this.calculateRequestSize(req));
        this.patchResponseMethods(res, requestId, startTime);
        res.setHeader('X-Request-ID', requestId);
        res.setHeader('Server-Timing', 'requestStart;dur=0');
        next();
    }
    patchResponseMethods(res, requestId, startTime) {
        const originalEnd = res.end;
        const originalWrite = res.write;
        let responseSize = 0;
        res.write = (...args) => {
            if (args[0]) {
                responseSize += args[0].length;
            }
            return originalWrite.apply(res, args);
        };
        res.end = (...args) => {
            const endTime = process.hrtime(startTime);
            const duration = endTime[0] * 1000 + endTime[1] / 1000000;
            if (args[0]) {
                responseSize += args[0].length;
            }
            const metrics = {
                requestId,
                method: res.req.method,
                url: res.req.url,
                statusCode: res.statusCode,
                duration,
                requestSize: this.requestSizes.get(requestId) || 0,
                responseSize,
                timestamp: new Date(),
                headers: {
                    request: res.req.headers,
                    response: res.getHeaders(),
                },
            };
            this.eventEmitter.emit('request.complete', metrics);
            const serverTiming = [
                'requestStart;dur=0',
                `total;dur=${duration.toFixed(2)}`,
            ].join(', ');
            res.setHeader('Server-Timing', serverTiming);
            this.requestSizes.delete(requestId);
            this.requestTimes.delete(requestId);
            return originalEnd.apply(res, args);
        };
    }
    calculateRequestSize(req) {
        let size = 0;
        size += this.calculateHeadersSize(req.headers);
        if (req.body) {
            size += this.calculateBodySize(req.body);
        }
        if (req.query) {
            size += this.calculateQuerySize(req.query);
        }
        return size;
    }
    calculateHeadersSize(headers) {
        return Object.entries(headers).reduce((size, [key, value]) => {
            return size + key.length + (value ? value.toString().length : 0);
        }, 0);
    }
    calculateBodySize(body) {
        try {
            return JSON.stringify(body).length;
        }
        catch (error) {
            this.logger.warn('Failed to calculate body size:', error);
            return 0;
        }
    }
    calculateQuerySize(query) {
        try {
            return JSON.stringify(query).length;
        }
        catch (error) {
            this.logger.warn('Failed to calculate query size:', error);
            return 0;
        }
    }
};
exports.PerformanceMiddleware = PerformanceMiddleware;
exports.PerformanceMiddleware = PerformanceMiddleware = PerformanceMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [performance_optimization_service_1.PerformanceOptimizationService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], PerformanceMiddleware);
//# sourceMappingURL=performance.middleware.js.map