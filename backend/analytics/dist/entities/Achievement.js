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
exports.Achievement = void 0;
const typeorm_1 = require("typeorm");
let Achievement = class Achievement {
};
exports.Achievement = Achievement;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], Achievement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Achievement.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Achievement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], Achievement.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['DAILY', 'WEEKLY', 'SPECIAL', 'MILESTONE']
    }),
    __metadata("design:type", String)
], Achievement.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], Achievement.prototype, "criteria", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], Achievement.prototype, "reward", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], Achievement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updatedAt' }),
    __metadata("design:type", Date)
], Achievement.prototype, "updatedAt", void 0);
exports.Achievement = Achievement = __decorate([
    (0, typeorm_1.Entity)('achievements')
], Achievement);
//# sourceMappingURL=Achievement.js.map