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
var RoleController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const role_service_1 = require("../services/role.service");
let RoleController = RoleController_1 = class RoleController {
    constructor(roleService) {
        this.roleService = roleService;
        this.logger = new common_1.Logger(RoleController_1.name);
    }
    async createRole(dto) {
        try {
            const role = await this.roleService.createRole(dto);
            return {
                success: true,
                message: 'Role created successfully',
                data: role,
            };
        }
        catch (error) {
            this.logger.error('Failed to create role:', error);
            throw new common_1.HttpException(error.message || 'Failed to create role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateRole(roleId, dto) {
        try {
            const role = await this.roleService.updateRole(roleId, dto);
            return {
                success: true,
                message: 'Role updated successfully',
                data: role,
            };
        }
        catch (error) {
            this.logger.error('Failed to update role:', error);
            throw new common_1.HttpException(error.message || 'Failed to update role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteRole(roleId) {
        try {
            await this.roleService.deleteRole(roleId);
            return {
                success: true,
                message: 'Role deleted successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to delete role:', error);
            throw new common_1.HttpException(error.message || 'Failed to delete role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async assignRoleToUser(userId, roleId) {
        try {
            await this.roleService.assignRoleToUser(userId, roleId);
            return {
                success: true,
                message: 'Role assigned successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to assign role:', error);
            throw new common_1.HttpException(error.message || 'Failed to assign role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async removeRoleFromUser(userId) {
        try {
            await this.roleService.removeRoleFromUser(userId);
            return {
                success: true,
                message: 'Role removed successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to remove role:', error);
            throw new common_1.HttpException(error.message || 'Failed to remove role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRole(roleId) {
        try {
            const role = await this.roleService.getRoleById(roleId);
            return {
                success: true,
                data: role,
            };
        }
        catch (error) {
            this.logger.error('Failed to get role:', error);
            throw new common_1.HttpException(error.message || 'Failed to get role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRoles(includeSystem) {
        try {
            const roles = await this.roleService.getRoles(includeSystem);
            return {
                success: true,
                data: roles,
            };
        }
        catch (error) {
            this.logger.error('Failed to get roles:', error);
            throw new common_1.HttpException(error.message || 'Failed to get roles', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserRole(userId) {
        try {
            const role = await this.roleService.getUserRole(userId);
            return {
                success: true,
                data: role,
            };
        }
        catch (error) {
            this.logger.error('Failed to get user role:', error);
            throw new common_1.HttpException(error.message || 'Failed to get user role', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRolePermissions(roleId) {
        try {
            const permissions = await this.roleService.getRolePermissions(roleId);
            return {
                success: true,
                data: permissions,
            };
        }
        catch (error) {
            this.logger.error('Failed to get role permissions:', error);
            throw new common_1.HttpException(error.message || 'Failed to get role permissions', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RoleController = RoleController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)(':roleId'),
    __param(0, (0, common_1.Param)('roleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)(':roleId'),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('assign/:userId/:roleId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "assignRoleToUser", null);
__decorate([
    (0, common_1.Delete)('remove/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "removeRoleFromUser", null);
__decorate([
    (0, common_1.Get)(':roleId'),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getRole", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('includeSystem')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getUserRole", null);
__decorate([
    (0, common_1.Get)(':roleId/permissions'),
    __param(0, (0, common_1.Param)('roleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getRolePermissions", null);
exports.RoleController = RoleController = RoleController_1 = __decorate([
    (0, common_1.Controller)('auth/roles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [role_service_1.RoleService])
], RoleController);
//# sourceMappingURL=role.controller.js.map