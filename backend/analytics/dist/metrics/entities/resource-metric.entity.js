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
exports.ResourceMetricEntity = exports.ResourceMetricType = exports.ResourceType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var ResourceType;
(function (ResourceType) {
    ResourceType["DATABASE"] = "DATABASE";
    ResourceType["CACHE"] = "CACHE";
    ResourceType["QUEUE"] = "QUEUE";
    ResourceType["STORAGE"] = "STORAGE";
    ResourceType["API"] = "API";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
var ResourceMetricType;
(function (ResourceMetricType) {
    ResourceMetricType["UTILIZATION"] = "UTILIZATION";
    ResourceMetricType["AVAILABILITY"] = "AVAILABILITY";
    ResourceMetricType["SATURATION"] = "SATURATION";
    ResourceMetricType["ERRORS"] = "ERRORS";
    ResourceMetricType["LATENCY"] = "LATENCY";
})(ResourceMetricType || (exports.ResourceMetricType = ResourceMetricType = {}));
let ResourceMetricEntity = class ResourceMetricEntity {
};
exports.ResourceMetricEntity = ResourceMetricEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ResourceMetricEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'enum', enum: ResourceType }),
    __metadata("design:type", String)
], ResourceMetricEntity.prototype, "resourceType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'enum', enum: ResourceMetricType }),
    __metadata("design:type", String)
], ResourceMetricEntity.prototype, "metricType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResourceMetricEntity.prototype, "resourceName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ResourceMetricEntity.prototype, "region", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], ResourceMetricEntity.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], ResourceMetricEntity.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ResourceMetricEntity.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], ResourceMetricEntity.prototype, "alerts", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], ResourceMetricEntity.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ResourceMetricEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ResourceMetricEntity.prototype, "updatedAt", void 0);
exports.ResourceMetricEntity = ResourceMetricEntity = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('resource_metrics'),
    (0, typeorm_1.Index)(['resourceType', 'metricType', 'timestamp']),
    (0, typeorm_1.Index)(['resourceName', 'timestamp'])
], ResourceMetricEntity);
//# sourceMappingURL=resource-metric.entity.js.map