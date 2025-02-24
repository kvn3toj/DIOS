"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureLifecycleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const feature_lifecycle_controller_1 = require("./feature-lifecycle.controller");
const feature_lifecycle_service_1 = require("./feature-lifecycle.service");
const feature_lifecycle_entity_1 = require("./entities/feature-lifecycle.entity");
const feature_flag_entity_1 = require("../feature-flags/entities/feature-flag.entity");
let FeatureLifecycleModule = class FeatureLifecycleModule {
};
exports.FeatureLifecycleModule = FeatureLifecycleModule;
exports.FeatureLifecycleModule = FeatureLifecycleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([feature_lifecycle_entity_1.FeatureLifecycle, feature_flag_entity_1.FeatureFlag])
        ],
        controllers: [feature_lifecycle_controller_1.FeatureLifecycleController],
        providers: [feature_lifecycle_service_1.FeatureLifecycleService],
        exports: [feature_lifecycle_service_1.FeatureLifecycleService]
    })
], FeatureLifecycleModule);
//# sourceMappingURL=feature-lifecycle.module.js.map