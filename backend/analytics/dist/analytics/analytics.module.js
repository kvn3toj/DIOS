"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_service_1 = require("./analytics.service");
const analytics_controller_1 = require("./analytics.controller");
const analytics_resolver_1 = require("./analytics.resolver");
const analytics_entity_1 = require("./entities/analytics.entity");
const real_time_analytics_service_1 = require("./services/real-time-analytics.service");
const batch_analytics_service_1 = require("./services/batch-analytics.service");
const aggregation_service_1 = require("./services/aggregation.service");
const data_retention_service_1 = require("./services/data-retention.service");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([analytics_entity_1.AnalyticsEntity])
        ],
        providers: [
            analytics_service_1.AnalyticsService,
            analytics_resolver_1.AnalyticsResolver,
            real_time_analytics_service_1.RealTimeAnalyticsService,
            batch_analytics_service_1.BatchAnalyticsService,
            aggregation_service_1.AggregationService,
            data_retention_service_1.DataRetentionService
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        exports: [analytics_service_1.AnalyticsService]
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map