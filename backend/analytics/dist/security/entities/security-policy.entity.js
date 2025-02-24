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
exports.SecurityPolicy = exports.SecurityLevel = void 0;
const typeorm_1 = require("typeorm");
var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["LOW"] = "low";
    SecurityLevel["MEDIUM"] = "medium";
    SecurityLevel["HIGH"] = "high";
    SecurityLevel["CRITICAL"] = "critical";
})(SecurityLevel || (exports.SecurityLevel = SecurityLevel = {}));
let SecurityPolicy = class SecurityPolicy {
};
exports.SecurityPolicy = SecurityPolicy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SecurityPolicy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SecurityPolicy.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SecurityLevel,
        default: SecurityLevel.MEDIUM
    }),
    __metadata("design:type", String)
], SecurityPolicy.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SecurityPolicy.prototype, "passwordPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SecurityPolicy.prototype, "mfaPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SecurityPolicy.prototype, "sessionPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SecurityPolicy.prototype, "rateLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], SecurityPolicy.prototype, "auditPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SecurityPolicy.prototype, "encryptionSettings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SecurityPolicy.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], SecurityPolicy.prototype, "appliedTo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SecurityPolicy.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SecurityPolicy.prototype, "updatedAt", void 0);
exports.SecurityPolicy = SecurityPolicy = __decorate([
    (0, typeorm_1.Entity)('security_policies')
], SecurityPolicy);
//# sourceMappingURL=security-policy.entity.js.map