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
exports.FeatureFlagsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feature_flag_entity_1 = require("./entities/feature-flag.entity");
const targeting_rule_entity_1 = require("./entities/targeting-rule.entity");
const experiment_group_entity_1 = require("./entities/experiment-group.entity");
let FeatureFlagsService = class FeatureFlagsService {
    constructor(featureFlagRepository, targetingRuleRepository, experimentGroupRepository) {
        this.featureFlagRepository = featureFlagRepository;
        this.targetingRuleRepository = targetingRuleRepository;
        this.experimentGroupRepository = experimentGroupRepository;
    }
    async createFeatureFlag(createDto) {
        const featureFlag = this.featureFlagRepository.create({
            ...createDto,
            isEnabled: false,
            rolloutPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return this.featureFlagRepository.save(featureFlag);
    }
    async getFeatureFlag(id) {
        const featureFlag = await this.featureFlagRepository.findOne({
            where: { id },
            relations: ['targetingRules', 'experimentGroups']
        });
        if (!featureFlag) {
            throw new common_1.NotFoundException(`Feature flag with ID "${id}" not found`);
        }
        return featureFlag;
    }
    async updateFeatureFlag(id, updateDto) {
        const featureFlag = await this.getFeatureFlag(id);
        Object.assign(featureFlag, {
            ...updateDto,
            updatedAt: new Date()
        });
        return this.featureFlagRepository.save(featureFlag);
    }
    async isFeatureEnabled(key, context = {}) {
        const featureFlag = await this.featureFlagRepository.findOne({
            where: { key },
            relations: ['targetingRules', 'experimentGroups']
        });
        if (!featureFlag || !featureFlag.isEnabled || featureFlag.isKillswitchEnabled) {
            return false;
        }
        if (featureFlag.targetingRules?.length > 0) {
            const matchesRules = await this.evaluateTargetingRules(featureFlag.targetingRules, context);
            if (!matchesRules) {
                return false;
            }
        }
        if (featureFlag.rolloutPercentage < 100) {
            const userHash = this.generateUserHash(context.userId || '');
            const userPercentile = userHash % 100;
            if (userPercentile >= featureFlag.rolloutPercentage) {
                return false;
            }
        }
        if (featureFlag.experimentGroups?.length > 0) {
            return this.evaluateExperimentGroups(featureFlag.experimentGroups, context);
        }
        return true;
    }
    async getFeatureFlags() {
        return this.featureFlagRepository.find({
            relations: ['targetingRules', 'experimentGroups']
        });
    }
    async deleteFeatureFlag(id) {
        const result = await this.featureFlagRepository.delete(id);
        return result.affected > 0;
    }
    async addTargetingRule(id, ruleData) {
        const featureFlag = await this.getFeatureFlag(id);
        const rule = this.targetingRuleRepository.create({
            ...ruleData,
            featureFlag
        });
        await this.targetingRuleRepository.save(rule);
        return this.getFeatureFlag(id);
    }
    async addExperimentGroup(id, groupData) {
        const featureFlag = await this.getFeatureFlag(id);
        const group = this.experimentGroupRepository.create({
            ...groupData,
            featureFlag
        });
        await this.experimentGroupRepository.save(group);
        return this.getFeatureFlag(id);
    }
    async updateRolloutPercentage(id, percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Rollout percentage must be between 0 and 100');
        }
        const featureFlag = await this.getFeatureFlag(id);
        featureFlag.rolloutPercentage = percentage;
        return this.featureFlagRepository.save(featureFlag);
    }
    async toggleKillswitch(id, enabled) {
        const featureFlag = await this.getFeatureFlag(id);
        featureFlag.isKillswitchEnabled = enabled;
        return this.featureFlagRepository.save(featureFlag);
    }
    async evaluateTargetingRules(rules, context) {
        for (const rule of rules) {
            const matches = await this.evaluateRule(rule, context);
            if (!matches) {
                return false;
            }
        }
        return true;
    }
    async evaluateRule(rule, context) {
        const contextValue = context[rule.attribute];
        switch (rule.operator) {
            case 'equals':
                return contextValue === rule.value;
            case 'contains':
                return contextValue?.includes(rule.value);
            case 'startsWith':
                return contextValue?.startsWith(rule.value);
            case 'endsWith':
                return contextValue?.endsWith(rule.value);
            case 'greaterThan':
                return contextValue > rule.value;
            case 'lessThan':
                return contextValue < rule.value;
            default:
                return false;
        }
    }
    async evaluateExperimentGroups(groups, context) {
        const userHash = this.generateUserHash(context.userId || '');
        const groupIndex = userHash % groups.length;
        return groups[groupIndex].isEnabled;
    }
    generateUserHash(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
};
exports.FeatureFlagsService = FeatureFlagsService;
exports.FeatureFlagsService = FeatureFlagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feature_flag_entity_1.FeatureFlag)),
    __param(1, (0, typeorm_1.InjectRepository)(targeting_rule_entity_1.TargetingRule)),
    __param(2, (0, typeorm_1.InjectRepository)(experiment_group_entity_1.ExperimentGroup)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FeatureFlagsService);
//# sourceMappingURL=feature-flags.service.js.map