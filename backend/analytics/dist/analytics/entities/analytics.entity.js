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
exports.AnalyticsEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("typeorm");
const analytics_type_enum_1 = require("../enums/analytics-type.enum");
const analytics_category_enum_1 = require("../enums/analytics-category.enum");
let AnalyticsEntity = class AnalyticsEntity {
};
exports.AnalyticsEntity = AnalyticsEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'enum', enum: analytics_type_enum_1.AnalyticsType }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'enum', enum: analytics_category_enum_1.AnalyticsCategory }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "event", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "deviceId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AnalyticsEntity.prototype, "version", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AnalyticsEntity.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalyticsEntity.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalyticsEntity.prototype, "context", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalyticsEntity.prototype, "customData", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalyticsEntity.prototype, "data", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalyticsEntity.prototype, "metrics", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AnalyticsEntity.prototype, "session", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AnalyticsEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AnalyticsEntity.prototype, "updatedAt", void 0);
exports.AnalyticsEntity = AnalyticsEntity = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('analytics'),
    (0, typeorm_1.Index)(['type', 'category']),
    (0, typeorm_1.Index)(['timestamp']),
    (0, typeorm_1.Index)(['userId'])
], AnalyticsEntity);
//# sourceMappingURL=analytics.entity.js.map