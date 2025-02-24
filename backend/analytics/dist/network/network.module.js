"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const network_config_service_1 = require("./services/network-config.service");
const network_monitoring_service_1 = require("../monitoring/services/network-monitoring.service");
const typeorm_1 = require("@nestjs/typeorm");
const network_metric_entity_1 = require("../monitoring/entities/network-metric.entity");
let NetworkModule = class NetworkModule {
};
exports.NetworkModule = NetworkModule;
exports.NetworkModule = NetworkModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forFeature([network_metric_entity_1.NetworkMetric]),
        ],
        providers: [
            network_config_service_1.NetworkConfigService,
            network_monitoring_service_1.NetworkMonitoringService,
        ],
        exports: [
            network_config_service_1.NetworkConfigService,
            network_monitoring_service_1.NetworkMonitoringService,
        ],
    })
], NetworkModule);
//# sourceMappingURL=network.module.js.map