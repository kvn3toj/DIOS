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
var NotificationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const notification_service_1 = require("../services/notification.service");
let NotificationController = NotificationController_1 = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(NotificationController_1.name);
    }
    async create(dto) {
        try {
            const notification = await this.notificationService.create(dto);
            return {
                success: true,
                data: notification,
            };
        }
        catch (error) {
            this.logger.error('Failed to create notification:', error);
            throw error;
        }
    }
    async update(id, dto) {
        try {
            const notification = await this.notificationService.update(id, dto);
            return {
                success: true,
                data: notification,
            };
        }
        catch (error) {
            this.logger.error('Failed to update notification:', error);
            throw error;
        }
    }
    async markAsRead(userId, ids) {
        try {
            await this.notificationService.markAsRead(userId, ids);
            return {
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Failed to mark notifications as read:', error);
            throw error;
        }
    }
    async delete(userId, ids) {
        try {
            await this.notificationService.delete(userId, ids);
            return {
                success: true,
            };
        }
        catch (error) {
            this.logger.error('Failed to delete notifications:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            const notification = await this.notificationService.findById(id);
            return {
                success: true,
                data: notification,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch notification:', error);
            throw error;
        }
    }
    async findAll(query) {
        try {
            const result = await this.notificationService.findAll(query);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch notifications:', error);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await this.notificationService.getUnreadCount(userId);
            return {
                success: true,
                data: {
                    count,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get unread count:', error);
            throw error;
        }
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'create' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'update' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('read'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'update' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'delete' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'read' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'read' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'notification', action: 'read' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
exports.NotificationController = NotificationController = NotificationController_1 = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map