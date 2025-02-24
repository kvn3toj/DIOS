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
exports.FeatureFlag = void 0;
const typeorm_1 = require("typeorm");
const targeting_rule_entity_1 = require("./targeting-rule.entity");
const experiment_group_entity_1 = require("./experiment-group.entity");
let FeatureFlag = class FeatureFlag {
};
exports.FeatureFlag = FeatureFlag;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FeatureFlag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], FeatureFlag.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FeatureFlag.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FeatureFlag.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FeatureFlag.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], FeatureFlag.prototype, "rolloutPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FeatureFlag.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => targeting_rule_entity_1.TargetingRule, rule => rule.featureFlag, { cascade: true }),
    __metadata("design:type", Array)
], FeatureFlag.prototype, "targetingRules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => experiment_group_entity_1.ExperimentGroup, group => group.featureFlag, { cascade: true }),
    __metadata("design:type", Array)
], FeatureFlag.prototype, "experimentGroups", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], FeatureFlag.prototype, "isKillswitchEnabled", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FeatureFlag.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FeatureFlag.prototype, "updatedAt", void 0);
exports.FeatureFlag = FeatureFlag = __decorate([
    (0, typeorm_1.Entity)('feature_flags')
], FeatureFlag);
//# sourceMappingURL=feature-flag.entity.js.map