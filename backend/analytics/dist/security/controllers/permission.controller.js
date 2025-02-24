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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const permission_service_1 = require("../services/permission.service");
const user_decorator_1 = require("../decorators/user.decorator");
let PermissionController = class PermissionController {
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    async grantPermission(grant) {
        await this.permissionService.grantPermission(grant);
        return { success: true, message: 'Permission granted successfully' };
    }
    async grantRolePermission(grant) {
        await this.permissionService.grantRolePermission(grant);
        return { success: true, message: 'Role permission granted successfully' };
    }
    async revokePermission(userId, resourceId, actionId) {
        await this.permissionService.revokePermission(userId, resourceId, actionId);
        return { success: true, message: 'Permission revoked successfully' };
    }
    async revokeRolePermission(roleId, resourceId, actionId) {
        await this.permissionService.revokeRolePermission(roleId, resourceId, actionId);
        return { success: true, message: 'Role permission revoked successfully' };
    }
    async addRoleInheritance(inheritance) {
        await this.permissionService.addRoleInheritance(inheritance.parentRoleId, inheritance.childRoleId);
        return { success: true, message: 'Role inheritance added successfully' };
    }
    async removeRoleInheritance(parentRoleId, childRoleId) {
        await this.permissionService.removeRoleInheritance(parentRoleId, childRoleId);
        return { success: true, message: 'Role inheritance removed successfully' };
    }
    async checkPermission(userId, resourceId, actionId, conditions) {
        const parsedConditions = conditions ? JSON.parse(conditions) : undefined;
        const hasPermission = await this.permissionService.checkPermission({
            userId,
            resourceId,
            actionId,
            conditions: parsedConditions,
        });
        return { success: true, hasPermission };
    }
};
exports.PermissionController = PermissionController;
__decorate([
    (0, common_1.Post)('grant'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "grantPermission", null);
__decorate([
    (0, common_1.Post)('grant-role'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "grantRolePermission", null);
__decorate([
    (0, common_1.Delete)('revoke/:userId/:resourceId/:actionId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Param)('actionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "revokePermission", null);
__decorate([
    (0, common_1.Delete)('revoke-role/:roleId/:resourceId/:actionId'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Param)('resourceId')),
    __param(2, (0, common_1.Param)('actionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "revokeRolePermission", null);
__decorate([
    (0, common_1.Post)('inheritance'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "addRoleInheritance", null);
__decorate([
    (0, common_1.Delete)('inheritance/:parentRoleId/:childRoleId'),
    __param(0, (0, common_1.Param)('parentRoleId')),
    __param(1, (0, common_1.Param)('childRoleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "removeRoleInheritance", null);
__decorate([
    (0, common_1.Get)('check'),
    __param(0, (0, user_decorator_1.User)('id')),
    __param(1, (0, common_1.Query)('resourceId')),
    __param(2, (0, common_1.Query)('actionId')),
    __param(3, (0, common_1.Query)('conditions')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PermissionController.prototype, "checkPermission", null);
exports.PermissionController = PermissionController = __decorate([
    (0, common_1.Controller)('auth/permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], PermissionController);
//# sourceMappingURL=permission.controller.js.map