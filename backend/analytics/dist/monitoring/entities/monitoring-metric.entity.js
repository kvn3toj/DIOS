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
exports.MonitoringMetric = void 0;
const typeorm_1 = require("typeorm");
let MonitoringMetric = class MonitoringMetric {
};
exports.MonitoringMetric = MonitoringMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MonitoringMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MonitoringMetric.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], MonitoringMetric.prototype, "cpu", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], MonitoringMetric.prototype, "memory", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], MonitoringMetric.prototype, "process", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], MonitoringMetric.prototype, "system", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['healthy', 'warning', 'critical'], default: 'healthy' }),
    __metadata("design:type", String)
], MonitoringMetric.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], MonitoringMetric.prototype, "alerts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['metric', 'alert'], default: 'metric' }),
    __metadata("design:type", String)
], MonitoringMetric.prototype, "type", void 0);
exports.MonitoringMetric = MonitoringMetric = __decorate([
    (0, typeorm_1.Entity)()
], MonitoringMetric);
//# sourceMappingURL=monitoring-metric.entity.js.map