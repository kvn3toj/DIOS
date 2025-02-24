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
exports.FeatureLifecycleController = void 0;
const common_1 = require("@nestjs/common");
const feature_lifecycle_service_1 = require("./feature-lifecycle.service");
class UpdateStateDto {
}
class UpdateMigrationPlanDto {
}
class UpdateCleanupStrategyDto {
}
class UpdateVersionControlDto {
}
let FeatureLifecycleController = class FeatureLifecycleController {
    constructor(lifecycleService) {
        this.lifecycleService = lifecycleService;
    }
    async createLifecycle(featureId) {
        return this.lifecycleService.createLifecycle(featureId);
    }
    async updateState(id, updateStateDto) {
        return this.lifecycleService.updateState(id, updateStateDto.state, updateStateDto.approver);
    }
    async addDependency(id, dependencyId) {
        return this.lifecycleService.addDependency(id, dependencyId);
    }
    async updateMigrationPlan(id, updateMigrationPlanDto) {
        return this.lifecycleService.updateMigrationPlan(id, updateMigrationPlanDto.steps, updateMigrationPlanDto.targetDate);
    }
    async updateCleanupStrategy(id, updateCleanupStrategyDto) {
        return this.lifecycleService.updateCleanupStrategy(id, updateCleanupStrategyDto.steps, updateCleanupStrategyDto.codeReferences, updateCleanupStrategyDto.dataReferences, updateCleanupStrategyDto.targetDate);
    }
    async updateVersionControl(id, updateVersionControlDto) {
        return this.lifecycleService.updateVersionControl(id, updateVersionControlDto.currentVersion, updateVersionControlDto.minimumSupportedVersion, updateVersionControlDto.breakingChanges);
    }
    async getLifecycle(id) {
        return this.lifecycleService.getLifecycle(id);
    }
    async getLifecycleByFeature(featureId) {
        return this.lifecycleService.getLifecycleByFeature(featureId);
    }
};
exports.FeatureLifecycleController = FeatureLifecycleController;
__decorate([
    (0, common_1.Post)(':featureId'),
    __param(0, (0, common_1.Param)('featureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "createLifecycle", null);
__decorate([
    (0, common_1.Put)(':id/state'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateStateDto]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "updateState", null);
__decorate([
    (0, common_1.Post)(':id/dependencies/:dependencyId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('dependencyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "addDependency", null);
__decorate([
    (0, common_1.Put)(':id/migration-plan'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateMigrationPlanDto]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "updateMigrationPlan", null);
__decorate([
    (0, common_1.Put)(':id/cleanup-strategy'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCleanupStrategyDto]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "updateCleanupStrategy", null);
__decorate([
    (0, common_1.Put)(':id/version-control'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateVersionControlDto]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "updateVersionControl", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "getLifecycle", null);
__decorate([
    (0, common_1.Get)('feature/:featureId'),
    __param(0, (0, common_1.Param)('featureId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureLifecycleController.prototype, "getLifecycleByFeature", null);
exports.FeatureLifecycleController = FeatureLifecycleController = __decorate([
    (0, common_1.Controller)('feature-lifecycle'),
    __metadata("design:paramtypes", [feature_lifecycle_service_1.FeatureLifecycleService])
], FeatureLifecycleController);
//# sourceMappingURL=feature-lifecycle.controller.js.map