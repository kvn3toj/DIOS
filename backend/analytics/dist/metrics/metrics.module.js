"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const metrics_service_1 = require("./metrics.service");
const metrics_controller_1 = require("./metrics.controller");
const metrics_resolver_1 = require("./metrics.resolver");
const system_metric_entity_1 = require("./entities/system-metric.entity");
const performance_metric_entity_1 = require("./entities/performance-metric.entity");
const resource_metric_entity_1 = require("./entities/resource-metric.entity");
const metrics_collector_service_1 = require("./services/metrics-collector.service");
const metrics_processor_service_1 = require("./services/metrics-processor.service");
const alerting_service_1 = require("./services/alerting.service");
let MetricsModule = class MetricsModule {
};
exports.MetricsModule = MetricsModule;
exports.MetricsModule = MetricsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                system_metric_entity_1.SystemMetricEntity,
                performance_metric_entity_1.PerformanceMetricEntity,
                resource_metric_entity_1.ResourceMetricEntity
            ])
        ],
        providers: [
            metrics_service_1.MetricsService,
            metrics_resolver_1.MetricsResolver,
            metrics_collector_service_1.MetricsCollectorService,
            metrics_processor_service_1.MetricsProcessorService,
            alerting_service_1.AlertingService
        ],
        controllers: [metrics_controller_1.MetricsController],
        exports: [metrics_service_1.MetricsService]
    })
], MetricsModule);
//# sourceMappingURL=metrics.module.js.map