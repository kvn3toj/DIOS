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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureLifecycle = exports.FeatureState = void 0;
const typeorm_1 = require("typeorm");
const feature_flag_entity_1 = require("../../feature-flags/entities/feature-flag.entity");
var FeatureState;
(function (FeatureState) {
    FeatureState["DEVELOPMENT"] = "development";
    FeatureState["ALPHA"] = "alpha";
    FeatureState["BETA"] = "beta";
    FeatureState["GA"] = "ga";
    FeatureState["DEPRECATED"] = "deprecated";
    FeatureState["SUNSET"] = "sunset";
})(FeatureState || (exports.FeatureState = FeatureState = {}));
let FeatureLifecycle = class FeatureLifecycle {
};
exports.FeatureLifecycle = FeatureLifecycle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FeatureLifecycle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => feature_flag_entity_1.FeatureFlag, { onDelete: 'CASCADE' }),
    __metadata("design:type", feature_flag_entity_1.FeatureFlag)
], FeatureLifecycle.prototype, "feature", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FeatureState,
        default: FeatureState.DEVELOPMENT
    }),
    __metadata("design:type", String)
], FeatureLifecycle.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FeatureLifecycle.prototype, "stateMetadata", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => feature_flag_entity_1.FeatureFlag),
    (0, typeorm_1.JoinTable)({
        name: 'feature_dependencies',
        joinColumn: { name: 'dependent_feature_id' },
        inverseJoinColumn: { name: 'dependency_id' }
    }),
    __metadata("design:type", Array)
], FeatureLifecycle.prototype, "dependencies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FeatureLifecycle.prototype, "migrationPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FeatureLifecycle.prototype, "cleanupStrategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], FeatureLifecycle.prototype, "usageMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FeatureLifecycle.prototype, "versionControl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FeatureLifecycle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FeatureLifecycle.prototype, "updatedAt", void 0);
exports.FeatureLifecycle = FeatureLifecycle = __decorate([
    (0, typeorm_1.Entity)('feature_lifecycle')
], FeatureLifecycle);
//# sourceMappingURL=feature-lifecycle.entity.js.map