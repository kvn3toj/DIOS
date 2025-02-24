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
exports.FeatureLifecycleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feature_lifecycle_entity_1 = require("./entities/feature-lifecycle.entity");
const feature_flag_entity_1 = require("../feature-flags/entities/feature-flag.entity");
let FeatureLifecycleService = class FeatureLifecycleService {
    constructor(lifecycleRepository, featureFlagRepository) {
        this.lifecycleRepository = lifecycleRepository;
        this.featureFlagRepository = featureFlagRepository;
    }
    async createLifecycle(featureId) {
        const feature = await this.featureFlagRepository.findOne({ where: { id: featureId } });
        if (!feature) {
            throw new common_1.NotFoundException(`Feature flag with ID "${featureId}" not found`);
        }
        const lifecycle = this.lifecycleRepository.create({
            feature,
            state: feature_lifecycle_entity_1.FeatureState.DEVELOPMENT,
            stateMetadata: {
                enteredAt: new Date(),
                criteria: [],
                approvedBy: ''
            },
            usageMetrics: {
                dailyActiveUsers: 0,
                weeklyActiveUsers: 0,
                monthlyActiveUsers: 0,
                errorRate: 0,
                latency: 0,
                lastUpdated: new Date()
            }
        });
        return this.lifecycleRepository.save(lifecycle);
    }
    async updateState(id, newState, approver) {
        const lifecycle = await this.lifecycleRepository.findOne({
            where: { id },
            relations: ['feature', 'dependencies']
        });
        if (!lifecycle) {
            throw new common_1.NotFoundException(`Feature lifecycle with ID "${id}" not found`);
        }
        if (!this.isValidStateTransition(lifecycle.state, newState)) {
            throw new common_1.BadRequestException(`Invalid state transition from ${lifecycle.state} to ${newState}`);
        }
        if (newState === feature_lifecycle_entity_1.FeatureState.GA) {
            await this.validateDependenciesForGA(lifecycle);
        }
        lifecycle.state = newState;
        lifecycle.stateMetadata = {
            enteredAt: new Date(),
            criteria: this.getStateEntryCriteria(newState),
            approvedBy: approver
        };
        return this.lifecycleRepository.save(lifecycle);
    }
    async addDependency(id, dependencyId) {
        const [lifecycle, dependency] = await Promise.all([
            this.lifecycleRepository.findOne({
                where: { id },
                relations: ['dependencies']
            }),
            this.featureFlagRepository.findOne({ where: { id: dependencyId } })
        ]);
        if (!lifecycle || !dependency) {
            throw new common_1.NotFoundException('Feature lifecycle or dependency not found');
        }
        if (await this.hasCircularDependency(lifecycle.id, dependencyId)) {
            throw new common_1.BadRequestException('Adding this dependency would create a circular reference');
        }
        lifecycle.dependencies = [...(lifecycle.dependencies || []), dependency];
        return this.lifecycleRepository.save(lifecycle);
    }
    async updateMigrationPlan(id, steps, targetDate) {
        const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
        if (!lifecycle) {
            throw new common_1.NotFoundException(`Feature lifecycle with ID "${id}" not found`);
        }
        lifecycle.migrationPlan = {
            steps: steps.map(description => ({ description })),
            targetDate
        };
        return this.lifecycleRepository.save(lifecycle);
    }
    async updateCleanupStrategy(id, steps, codeRefs, dataRefs, targetDate) {
        const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
        if (!lifecycle) {
            throw new common_1.NotFoundException(`Feature lifecycle with ID "${id}" not found`);
        }
        lifecycle.cleanupStrategy = {
            steps,
            codeReferences: codeRefs,
            dataReferences: dataRefs,
            targetDate
        };
        return this.lifecycleRepository.save(lifecycle);
    }
    async updateUsageMetrics(id, metrics) {
        const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
        if (!lifecycle) {
            throw new common_1.NotFoundException(`Feature lifecycle with ID "${id}" not found`);
        }
        lifecycle.usageMetrics = {
            ...lifecycle.usageMetrics,
            ...metrics,
            lastUpdated: new Date()
        };
        return this.lifecycleRepository.save(lifecycle);
    }
    async updateVersionControl(id, currentVersion, minVersion, breakingChanges) {
        const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
        if (!lifecycle) {
            throw new common_1.NotFoundException(`Feature lifecycle with ID "${id}" not found`);
        }
        lifecycle.versionControl = {
            currentVersion,
            minimumSupportedVersion: minVersion,
            breakingChanges
        };
        return this.lifecycleRepository.save(lifecycle);
    }
    isValidStateTransition(currentState, newState) {
        const validTransitions = {
            [feature_lifecycle_entity_1.FeatureState.DEVELOPMENT]: [feature_lifecycle_entity_1.FeatureState.ALPHA],
            [feature_lifecycle_entity_1.FeatureState.ALPHA]: [feature_lifecycle_entity_1.FeatureState.BETA, feature_lifecycle_entity_1.FeatureState.DEVELOPMENT],
            [feature_lifecycle_entity_1.FeatureState.BETA]: [feature_lifecycle_entity_1.FeatureState.GA, feature_lifecycle_entity_1.FeatureState.ALPHA],
            [feature_lifecycle_entity_1.FeatureState.GA]: [feature_lifecycle_entity_1.FeatureState.DEPRECATED],
            [feature_lifecycle_entity_1.FeatureState.DEPRECATED]: [feature_lifecycle_entity_1.FeatureState.SUNSET],
            [feature_lifecycle_entity_1.FeatureState.SUNSET]: []
        };
        return validTransitions[currentState].includes(newState);
    }
    async validateDependenciesForGA(lifecycle) {
        if (!lifecycle.dependencies?.length) {
            return;
        }
        const nonGADependencies = await this.lifecycleRepository
            .createQueryBuilder('lifecycle')
            .innerJoin('lifecycle.feature', 'feature')
            .where('feature.id IN (:...ids)', {
            ids: lifecycle.dependencies.map(d => d.id)
        })
            .andWhere('lifecycle.state != :gaState', { gaState: feature_lifecycle_entity_1.FeatureState.GA })
            .getCount();
        if (nonGADependencies > 0) {
            throw new common_1.BadRequestException('All dependencies must be in GA state before promoting to GA');
        }
    }
    async hasCircularDependency(sourceId, targetId, visited = new Set()) {
        if (visited.has(targetId)) {
            return true;
        }
        visited.add(targetId);
        const target = await this.lifecycleRepository.findOne({
            where: { id: targetId },
            relations: ['dependencies']
        });
        if (!target?.dependencies?.length) {
            return false;
        }
        for (const dependency of target.dependencies) {
            if (dependency.id === sourceId || await this.hasCircularDependency(sourceId, dependency.id, visited)) {
                return true;
            }
        }
        return false;
    }
    getStateEntryCriteria(state) {
        const criteria = {
            [feature_lifecycle_entity_1.FeatureState.ALPHA]: [
                'Basic functionality implemented',
                'Unit tests written',
                'Documentation started'
            ],
            [feature_lifecycle_entity_1.FeatureState.BETA]: [
                'All core functionality implemented',
                'Integration tests complete',
                'Documentation complete',
                'Performance benchmarks established'
            ],
            [feature_lifecycle_entity_1.FeatureState.GA]: [
                'All tests passing',
                'Documentation reviewed and approved',
                'Performance requirements met',
                'Security review complete',
                'Load testing complete'
            ],
            [feature_lifecycle_entity_1.FeatureState.DEPRECATED]: [
                'Replacement feature identified',
                'Migration guide published',
                'Timeline communicated'
            ],
            [feature_lifecycle_entity_1.FeatureState.SUNSET]: [
                'All users migrated',
                'No active usage',
                'Cleanup plan approved'
            ]
        };
        return criteria[state] || [];
    }
};
exports.FeatureLifecycleService = FeatureLifecycleService;
exports.FeatureLifecycleService = FeatureLifecycleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feature_lifecycle_entity_1.FeatureLifecycle)),
    __param(1, (0, typeorm_1.InjectRepository)(feature_flag_entity_1.FeatureFlag)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FeatureLifecycleService);
//# sourceMappingURL=feature-lifecycle.service.js.map