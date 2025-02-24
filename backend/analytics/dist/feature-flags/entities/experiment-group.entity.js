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
exports.ExperimentGroup = void 0;
const typeorm_1 = require("typeorm");
const feature_flag_entity_1 = require("./feature-flag.entity");
let ExperimentGroup = class ExperimentGroup {
};
exports.ExperimentGroup = ExperimentGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExperimentGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExperimentGroup.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExperimentGroup.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ExperimentGroup.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ExperimentGroup.prototype, "trafficAllocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ExperimentGroup.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ExperimentGroup.prototype, "variants", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => feature_flag_entity_1.FeatureFlag, featureFlag => featureFlag.experimentGroups, { onDelete: 'CASCADE' }),
    __metadata("design:type", feature_flag_entity_1.FeatureFlag)
], ExperimentGroup.prototype, "featureFlag", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExperimentGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExperimentGroup.prototype, "updatedAt", void 0);
exports.ExperimentGroup = ExperimentGroup = __decorate([
    (0, typeorm_1.Entity)('experiment_groups')
], ExperimentGroup);
//# sourceMappingURL=experiment-group.entity.js.map