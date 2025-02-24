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
exports.ErrorLog = void 0;
const typeorm_1 = require("typeorm");
let ErrorLog = class ErrorLog {
};
exports.ErrorLog = ErrorLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ErrorLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], ErrorLog.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ErrorLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "stack", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], ErrorLog.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['new', 'investigating', 'resolved', 'ignored'],
        default: 'new'
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ErrorLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: [] }),
    __metadata("design:type", Array)
], ErrorLog.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ErrorLog.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ErrorLog.prototype, "resolution", void 0);
exports.ErrorLog = ErrorLog = __decorate([
    (0, typeorm_1.Entity)()
], ErrorLog);
//# sourceMappingURL=error-log.entity.js.map