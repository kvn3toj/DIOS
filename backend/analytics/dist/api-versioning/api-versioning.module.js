"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersioningModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const api_versioning_controller_1 = require("./api-versioning.controller");
const api_versioning_service_1 = require("./api-versioning.service");
const api_version_entity_1 = require("./entities/api-version.entity");
let ApiVersioningModule = class ApiVersioningModule {
};
exports.ApiVersioningModule = ApiVersioningModule;
exports.ApiVersioningModule = ApiVersioningModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([api_version_entity_1.ApiVersion])
        ],
        controllers: [api_versioning_controller_1.ApiVersioningController],
        providers: [api_versioning_service_1.ApiVersioningService],
        exports: [api_versioning_service_1.ApiVersioningService]
    })
], ApiVersioningModule);
//# sourceMappingURL=api-versioning.module.js.map