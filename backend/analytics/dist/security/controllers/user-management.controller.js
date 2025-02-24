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
var UserManagementController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const user_management_service_1 = require("../services/user-management.service");
let UserManagementController = UserManagementController_1 = class UserManagementController {
    constructor(userManagementService) {
        this.userManagementService = userManagementService;
        this.logger = new common_1.Logger(UserManagementController_1.name);
    }
    async createUser(createUserDto) {
        try {
            const user = await this.userManagementService.createUser(createUserDto);
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            this.logger.error('Failed to create user:', error);
            throw error;
        }
    }
    async updateUser(userId, updateUserDto) {
        try {
            const user = await this.userManagementService.updateUser(userId, updateUserDto);
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update user ${userId}:`, error);
            throw error;
        }
    }
    async deleteUser(userId) {
        try {
            await this.userManagementService.deleteUser(userId);
            return {
                success: true,
                message: 'User deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete user ${userId}:`, error);
            throw error;
        }
    }
    async getUser(userId) {
        try {
            const user = await this.userManagementService.getUser(userId);
            return {
                success: true,
                data: user,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get user ${userId}:`, error);
            throw error;
        }
    }
    async getUsers(search, role, isVerified, hasCompletedSetup, startDate, endDate, limit, offset) {
        try {
            const filters = {
                search,
                role,
                isVerified,
                hasCompletedSetup,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit,
                offset,
            };
            const result = await this.userManagementService.getUsers(filters);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to get users:', error);
            throw error;
        }
    }
    async updateUserSetupProgress(userId, step, completed) {
        try {
            const progress = await this.userManagementService.updateUserSetupProgress(userId, step, completed);
            return {
                success: true,
                data: progress,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update setup progress for user ${userId}:`, error);
            throw error;
        }
    }
    async completeUserSetup(userId) {
        try {
            const result = await this.userManagementService.completeUserSetup(userId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Failed to complete setup for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.UserManagementController = UserManagementController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'create' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)(':userId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'update' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':userId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'delete' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)(':userId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'read' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'list' }),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('isVerified')),
    __param(3, (0, common_1.Query)('hasCompletedSetup')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('limit')),
    __param(7, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, Boolean, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Put)(':userId/setup-progress'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'update' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('step')),
    __param(2, (0, common_1.Body)('completed')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "updateUserSetupProgress", null);
__decorate([
    (0, common_1.Put)(':userId/complete-setup'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'users', action: 'update' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "completeUserSetup", null);
exports.UserManagementController = UserManagementController = UserManagementController_1 = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_management_service_1.UserManagementService])
], UserManagementController);
//# sourceMappingURL=user-management.controller.js.map