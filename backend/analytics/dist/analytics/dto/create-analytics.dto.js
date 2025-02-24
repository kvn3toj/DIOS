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
exports.CreateAnalyticsDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const analytics_entity_1 = require("../entities/analytics.entity");
let MetricsInput = class MetricsInput {
};
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricsInput.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricsInput.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricsInput.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], MetricsInput.prototype, "custom", void 0);
MetricsInput = __decorate([
    (0, graphql_1.InputType)()
], MetricsInput);
let SessionInput = class SessionInput {
};
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SessionInput.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SessionInput.prototype, "duration", void 0);
SessionInput = __decorate([
    (0, graphql_1.InputType)()
], SessionInput);
let CreateAnalyticsDto = class CreateAnalyticsDto {
};
exports.CreateAnalyticsDto = CreateAnalyticsDto;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(analytics_entity_1.AnalyticsType),
    __metadata("design:type", typeof (_a = typeof analytics_entity_1.AnalyticsType !== "undefined" && analytics_entity_1.AnalyticsType) === "function" ? _a : Object)
], CreateAnalyticsDto.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)(analytics_entity_1.AnalyticsCategory),
    __metadata("design:type", typeof (_b = typeof analytics_entity_1.AnalyticsCategory !== "undefined" && analytics_entity_1.AnalyticsCategory) === "function" ? _b : Object)
], CreateAnalyticsDto.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnalyticsDto.prototype, "event", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAnalyticsDto.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnalyticsDto.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnalyticsDto.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnalyticsDto.prototype, "version", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateAnalyticsDto.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => MetricsInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetricsInput),
    __metadata("design:type", MetricsInput)
], CreateAnalyticsDto.prototype, "metrics", void 0);
__decorate([
    (0, graphql_1.Field)(() => SessionInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SessionInput),
    __metadata("design:type", SessionInput)
], CreateAnalyticsDto.prototype, "session", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAnalyticsDto.prototype, "timestamp", void 0);
exports.CreateAnalyticsDto = CreateAnalyticsDto = __decorate([
    (0, graphql_1.InputType)()
], CreateAnalyticsDto);
//# sourceMappingURL=create-analytics.dto.js.map