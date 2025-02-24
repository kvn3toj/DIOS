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
exports.TargetingRule = void 0;
const typeorm_1 = require("typeorm");
const feature_flag_entity_1 = require("./feature-flag.entity");
let TargetingRule = class TargetingRule {
};
exports.TargetingRule = TargetingRule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TargetingRule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TargetingRule.prototype, "attribute", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan']
    }),
    __metadata("design:type", String)
], TargetingRule.prototype, "operator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], TargetingRule.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TargetingRule.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => feature_flag_entity_1.FeatureFlag, featureFlag => featureFlag.targetingRules, { onDelete: 'CASCADE' }),
    __metadata("design:type", feature_flag_entity_1.FeatureFlag)
], TargetingRule.prototype, "featureFlag", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TargetingRule.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TargetingRule.prototype, "updatedAt", void 0);
exports.TargetingRule = TargetingRule = __decorate([
    (0, typeorm_1.Entity)('targeting_rules')
], TargetingRule);
//# sourceMappingURL=targeting-rule.entity.js.map