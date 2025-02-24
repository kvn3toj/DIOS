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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAnalyticsDto = void 0;
const class_validator_1 = require("class-validator");
const analytics_entity_1 = require("../entities/analytics.entity");
class UpdateAnalyticsDto {
}
exports.UpdateAnalyticsDto = UpdateAnalyticsDto;
__decorate([
    (0, class_validator_1.IsEnum)(analytics_entity_1.AnalyticsType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _a : Object)
], UpdateAnalyticsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(analytics_entity_1.AnalyticsCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _b : Object)
], UpdateAnalyticsDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAnalyticsDto.prototype, "event", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAnalyticsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAnalyticsDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAnalyticsDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAnalyticsDto.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAnalyticsDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAnalyticsDto.prototype, "metrics", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAnalyticsDto.prototype, "session", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAnalyticsDto.prototype, "timestamp", void 0);
//# sourceMappingURL=update-analytics.dto.js.map