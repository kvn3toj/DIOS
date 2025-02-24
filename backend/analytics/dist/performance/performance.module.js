"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const performance_optimization_service_1 = require("./services/performance-optimization.service");
const performance_middleware_1 = require("./middleware/performance.middleware");
const performance_metric_entity_1 = require("../metrics/entities/performance-metric.entity");
const redis_module_1 = require("../shared/redis/redis.module");
const metrics_module_1 = require("../metrics/metrics.module");
let PerformanceModule = class PerformanceModule {
    configure(consumer) {
        consumer
            .apply(performance_middleware_1.PerformanceMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.PerformanceModule = PerformanceModule;
exports.PerformanceModule = PerformanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([performance_metric_entity_1.PerformanceMetricEntity]),
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 20,
                verboseMemoryLeak: true,
                ignoreErrors: false,
            }),
            redis_module_1.RedisModule,
            metrics_module_1.MetricsModule,
        ],
        providers: [
            performance_optimization_service_1.PerformanceOptimizationService,
        ],
        exports: [
            performance_optimization_service_1.PerformanceOptimizationService,
        ],
    })
], PerformanceModule);
//# sourceMappingURL=performance.module.js.map