"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const monitoring_controller_1 = require("./monitoring.controller");
const monitoring_service_1 = require("./services/monitoring.service");
const performance_tracking_service_1 = require("./services/performance-tracking.service");
const error_tracking_service_1 = require("./error-tracking.service");
const resource_monitoring_service_1 = require("./services/resource-monitoring.service");
const network_monitoring_service_1 = require("./services/network-monitoring.service");
const database_monitoring_service_1 = require("./services/database-monitoring.service");
const cache_monitoring_service_1 = require("./services/cache-monitoring.service");
const resource_metric_entity_1 = require("./entities/resource-metric.entity");
const error_log_entity_1 = require("./entities/error-log.entity");
const network_metric_entity_1 = require("./entities/network-metric.entity");
const database_metric_entity_1 = require("./entities/database-metric.entity");
const cache_metric_entity_1 = require("./entities/cache-metric.entity");
const technical_metric_entity_1 = require("./entities/technical-metric.entity");
const business_metric_entity_1 = require("./entities/business-metric.entity");
let MonitoringModule = class MonitoringModule {
};
exports.MonitoringModule = MonitoringModule;
exports.MonitoringModule = MonitoringModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                error_log_entity_1.ErrorLog,
                resource_metric_entity_1.ResourceMetric,
                network_metric_entity_1.NetworkMetric,
                database_metric_entity_1.DatabaseMetric,
                cache_metric_entity_1.CacheMetric,
                technical_metric_entity_1.TechnicalMetric,
                business_metric_entity_1.BusinessMetric
            ]),
            config_1.ConfigModule,
            event_emitter_1.EventEmitterModule.forRoot()
        ],
        controllers: [monitoring_controller_1.MonitoringController],
        providers: [
            monitoring_service_1.MonitoringService,
            performance_tracking_service_1.PerformanceTrackingService,
            error_tracking_service_1.ErrorTrackingService,
            resource_monitoring_service_1.ResourceMonitoringService,
            network_monitoring_service_1.NetworkMonitoringService,
            database_monitoring_service_1.DatabaseMonitoringService,
            cache_monitoring_service_1.CacheMonitoringService
        ],
        exports: [
            monitoring_service_1.MonitoringService,
            performance_tracking_service_1.PerformanceTrackingService,
            error_tracking_service_1.ErrorTrackingService,
            resource_monitoring_service_1.ResourceMonitoringService,
            network_monitoring_service_1.NetworkMonitoringService,
            database_monitoring_service_1.DatabaseMonitoringService,
            cache_monitoring_service_1.CacheMonitoringService
        ]
    })
], MonitoringModule);
//# sourceMappingURL=monitoring.module.js.map