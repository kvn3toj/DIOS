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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersioningController = void 0;
const common_1 = require("@nestjs/common");
const api_versioning_service_1 = require("./api-versioning.service");
class CreateVersionDto {
}
class DeprecationPolicyDto {
}
class BreakingChangeDto {
}
class UpdateMetricsDto {
}
class UpdateDocumentationDto {
}
let ApiVersioningController = class ApiVersioningController {
    constructor(versioningService) {
        this.versioningService = versioningService;
    }
    async createVersion(createVersionDto) {
        return this.versioningService.createVersion(createVersionDto.version, createVersionDto.path, createVersionDto.supportedFeatures, createVersionDto.compatibility);
    }
    async deprecateVersion(version, deprecationPolicyDto) {
        return this.versioningService.deprecateVersion(version, deprecationPolicyDto);
    }
    async sunsetVersion(version) {
        return this.versioningService.sunsetVersion(version);
    }
    async updateMetrics(version, metricsDto) {
        return this.versioningService.updateMetrics(version, metricsDto);
    }
    async addBreakingChange(version, breakingChangeDto) {
        return this.versioningService.addBreakingChange(version, breakingChangeDto);
    }
    async updateDocumentation(version, documentationDto) {
        return this.versioningService.updateDocumentation(version, documentationDto);
    }
    async getActiveVersions() {
        return this.versioningService.getActiveVersions();
    }
    async validateClientVersion(clientVersion) {
        return this.versioningService.validateClientVersion(clientVersion);
    }
};
exports.ApiVersioningController = ApiVersioningController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateVersionDto]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "createVersion", null);
__decorate([
    (0, common_1.Put)(':version/deprecate'),
    __param(0, (0, common_1.Param)('version')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, DeprecationPolicyDto]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "deprecateVersion", null);
__decorate([
    (0, common_1.Put)(':version/sunset'),
    __param(0, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "sunsetVersion", null);
__decorate([
    (0, common_1.Put)(':version/metrics'),
    __param(0, (0, common_1.Param)('version')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateMetricsDto]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "updateMetrics", null);
__decorate([
    (0, common_1.Post)(':version/breaking-changes'),
    __param(0, (0, common_1.Param)('version')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, BreakingChangeDto]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "addBreakingChange", null);
__decorate([
    (0, common_1.Put)(':version/documentation'),
    __param(0, (0, common_1.Param)('version')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateDocumentationDto]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "updateDocumentation", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "getActiveVersions", null);
__decorate([
    (0, common_1.Get)('validate/:clientVersion'),
    __param(0, (0, common_1.Param)('clientVersion')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApiVersioningController.prototype, "validateClientVersion", null);
exports.ApiVersioningController = ApiVersioningController = __decorate([
    (0, common_1.Controller)('api-versions'),
    __metadata("design:paramtypes", [api_versioning_service_1.ApiVersioningService])
], ApiVersioningController);
//# sourceMappingURL=api-versioning.controller.js.map