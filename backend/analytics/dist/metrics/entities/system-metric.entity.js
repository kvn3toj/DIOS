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
exports.SystemMetricEntity = exports.SystemMetricType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var SystemMetricType;
(function (SystemMetricType) {
    SystemMetricType["CPU"] = "CPU";
    SystemMetricType["MEMORY"] = "MEMORY";
    SystemMetricType["DISK"] = "DISK";
    SystemMetricType["NETWORK"] = "NETWORK";
    SystemMetricType["PROCESS"] = "PROCESS";
})(SystemMetricType || (exports.SystemMetricType = SystemMetricType = {}));
let SystemMetricEntity = class SystemMetricEntity {
};
exports.SystemMetricEntity = SystemMetricEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SystemMetricEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'enum', enum: SystemMetricType }),
    __metadata("design:type", String)
], SystemMetricEntity.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SystemMetricEntity.prototype, "service", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SystemMetricEntity.prototype, "instance", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], SystemMetricEntity.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON),
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SystemMetricEntity.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => JSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SystemMetricEntity.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], SystemMetricEntity.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SystemMetricEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SystemMetricEntity.prototype, "updatedAt", void 0);
exports.SystemMetricEntity = SystemMetricEntity = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('system_metrics'),
    (0, typeorm_1.Index)(['type', 'timestamp']),
    (0, typeorm_1.Index)(['service', 'timestamp'])
], SystemMetricEntity);
//# sourceMappingURL=system-metric.entity.js.map