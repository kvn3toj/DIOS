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
exports.PerformanceMetricEntity = exports.PerformanceMetricType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var PerformanceMetricType;
(function (PerformanceMetricType) {
    PerformanceMetricType["RESPONSE_TIME"] = "RESPONSE_TIME";
    PerformanceMetricType["THROUGHPUT"] = "THROUGHPUT";
    PerformanceMetricType["ERROR_RATE"] = "ERROR_RATE";
    PerformanceMetricType["LATENCY"] = "LATENCY";
    PerformanceMetricType["CONCURRENT_USERS"] = "CONCURRENT_USERS";
    PerformanceMetricType["RESOURCE_USAGE"] = "RESOURCE_USAGE";
})(PerformanceMetricType || (exports.PerformanceMetricType = PerformanceMetricType = {}));
let PerformanceMetricEntity = class PerformanceMetricEntity {
};
exports.PerformanceMetricEntity = PerformanceMetricEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'enum', enum: PerformanceMetricType }),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "endpoint", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "method", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "percentile95", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "percentile99", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], PerformanceMetricEntity.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PerformanceMetricEntity.prototype, "breakdown", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], PerformanceMetricEntity.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PerformanceMetricEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PerformanceMetricEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "statusCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "requestSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "responseSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "cpuUsage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "memoryUsage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PerformanceMetricEntity.prototype, "concurrentRequests", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], PerformanceMetricEntity.prototype, "isError", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PerformanceMetricEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "environment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PerformanceMetricEntity.prototype, "requestId", void 0);
exports.PerformanceMetricEntity = PerformanceMetricEntity = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('performance_metrics'),
    (0, typeorm_1.Index)(['type', 'timestamp']),
    (0, typeorm_1.Index)(['endpoint', 'timestamp'])
], PerformanceMetricEntity);
//# sourceMappingURL=performance-metric.entity.js.map