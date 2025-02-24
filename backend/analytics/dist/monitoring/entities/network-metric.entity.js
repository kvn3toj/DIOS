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
exports.NetworkMetric = void 0;
const typeorm_1 = require("typeorm");
let NetworkMetric = class NetworkMetric {
};
exports.NetworkMetric = NetworkMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NetworkMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], NetworkMetric.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "bytesIn", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "bytesOut", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "packetsIn", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "packetsOut", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "errors", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "dropped", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "avgLatency", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "maxLatency", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "minLatency", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "jitter", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "packetLoss", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], NetworkMetric.prototype, "connectionStatus", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "activeConnections", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "connectionErrors", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "utilization", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], NetworkMetric.prototype, "saturation", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], NetworkMetric.prototype, "bandwidth", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], NetworkMetric.prototype, "metadata", void 0);
exports.NetworkMetric = NetworkMetric = __decorate([
    (0, typeorm_1.Entity)()
], NetworkMetric);
//# sourceMappingURL=network-metric.entity.js.map