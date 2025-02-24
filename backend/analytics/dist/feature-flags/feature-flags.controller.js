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
exports.FeatureFlagsController = void 0;
const common_1 = require("@nestjs/common");
const feature_flags_service_1 = require("./feature-flags.service");
const create_feature_flag_dto_1 = require("./dto/create-feature-flag.dto");
const update_feature_flag_dto_1 = require("./dto/update-feature-flag.dto");
let FeatureFlagsController = class FeatureFlagsController {
    constructor(featureFlagsService) {
        this.featureFlagsService = featureFlagsService;
    }
    async createFeatureFlag(createDto) {
        return this.featureFlagsService.createFeatureFlag(createDto);
    }
    async getFeatureFlags() {
        return this.featureFlagsService.getFeatureFlags();
    }
    async getFeatureFlag(id) {
        const featureFlag = await this.featureFlagsService.getFeatureFlag(id);
        if (!featureFlag) {
            throw new Error('Feature flag not found');
        }
        return featureFlag;
    }
    async updateFeatureFlag(id, updateDto) {
        return this.featureFlagsService.updateFeatureFlag(id, updateDto);
    }
    async deleteFeatureFlag(id) {
        return this.featureFlagsService.deleteFeatureFlag(id);
    }
    async evaluateFeature(key, context) {
        const isEnabled = await this.featureFlagsService.isFeatureEnabled(key, context);
        return { isEnabled };
    }
    async addTargetingRule(id, rule) {
        return this.featureFlagsService.addTargetingRule(id, rule);
    }
    async addExperimentGroup(id, group) {
        return this.featureFlagsService.addExperimentGroup(id, group);
    }
    async updateRolloutPercentage(id, percentage) {
        return this.featureFlagsService.updateRolloutPercentage(id, percentage);
    }
    async toggleKillswitch(id, enabled) {
        return this.featureFlagsService.toggleKillswitch(id, enabled);
    }
};
exports.FeatureFlagsController = FeatureFlagsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_feature_flag_dto_1.CreateFeatureFlagDto]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "createFeatureFlag", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "getFeatureFlags", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "getFeatureFlag", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_feature_flag_dto_1.UpdateFeatureFlagDto]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "updateFeatureFlag", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "deleteFeatureFlag", null);
__decorate([
    (0, common_1.Get)('evaluate/:key'),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "evaluateFeature", null);
__decorate([
    (0, common_1.Post)(':id/targeting-rules'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "addTargetingRule", null);
__decorate([
    (0, common_1.Post)(':id/experiment-groups'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "addExperimentGroup", null);
__decorate([
    (0, common_1.Put)(':id/rollout'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('percentage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "updateRolloutPercentage", null);
__decorate([
    (0, common_1.Put)(':id/killswitch'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('enabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], FeatureFlagsController.prototype, "toggleKillswitch", null);
exports.FeatureFlagsController = FeatureFlagsController = __decorate([
    (0, common_1.Controller)('feature-flags'),
    __metadata("design:paramtypes", [feature_flags_service_1.FeatureFlagsService])
], FeatureFlagsController);
//# sourceMappingURL=feature-flags.controller.js.map