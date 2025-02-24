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
exports.ApiVersion = exports.VersionStatus = void 0;
const typeorm_1 = require("typeorm");
var VersionStatus;
(function (VersionStatus) {
    VersionStatus["CURRENT"] = "current";
    VersionStatus["DEPRECATED"] = "deprecated";
    VersionStatus["SUNSET"] = "sunset";
})(VersionStatus || (exports.VersionStatus = VersionStatus = {}));
let ApiVersion = class ApiVersion {
};
exports.ApiVersion = ApiVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApiVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ApiVersion.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ApiVersion.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VersionStatus,
        default: VersionStatus.CURRENT
    }),
    __metadata("design:type", String)
], ApiVersion.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ApiVersion.prototype, "compatibility", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ApiVersion.prototype, "deprecationPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], ApiVersion.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: [] }),
    __metadata("design:type", Array)
], ApiVersion.prototype, "supportedFeatures", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ApiVersion.prototype, "documentation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ApiVersion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ApiVersion.prototype, "updatedAt", void 0);
exports.ApiVersion = ApiVersion = __decorate([
    (0, typeorm_1.Entity)('api_versions')
], ApiVersion);
//# sourceMappingURL=api-version.entity.js.map