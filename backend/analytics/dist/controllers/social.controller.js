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
var SocialController_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const social_service_1 = require("../services/social.service");
const social_model_1 = require("../models/social.model");
let SocialController = SocialController_1 = class SocialController {
    constructor(socialService) {
        this.socialService = socialService;
        this.logger = new common_1.Logger(SocialController_1.name);
    }
    async createProfile(userId, profile) {
        try {
            const newProfile = await this.socialService.createProfile(userId, profile);
            return {
                success: true,
                data: newProfile,
            };
        }
        catch (error) {
            this.logger.error('Failed to create profile:', error);
            throw error;
        }
    }
    async updateProfile(userId, updates) {
        try {
            const updatedProfile = await this.socialService.updateProfile(userId, updates);
            return {
                success: true,
                data: updatedProfile,
            };
        }
        catch (error) {
            this.logger.error('Failed to update profile:', error);
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const profile = await this.socialService.getProfile(userId);
            return {
                success: true,
                data: profile,
            };
        }
        catch (error) {
            this.logger.error('Failed to get profile:', error);
            throw error;
        }
    }
    async searchProfiles(displayName, location, createdAfter, createdBefore, limit, offset, sortBy, sortOrder) {
        try {
            const query = {
                displayName,
                location,
                createdAfter,
                createdBefore,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.socialService.searchProfiles(query);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to search profiles:', error);
            throw error;
        }
    }
    async createConnection(requesterId, recipientId) {
        try {
            const newConnection = await this.socialService.createConnection(requesterId, recipientId);
            return {
                success: true,
                data: newConnection,
            };
        }
        catch (error) {
            this.logger.error('Failed to create connection:', error);
            throw error;
        }
    }
    async updateConnectionStatus(connectionId, userId, status) {
        try {
            const updatedConnection = await this.socialService.updateConnectionStatus(connectionId, userId, status);
            return {
                success: true,
                data: updatedConnection,
            };
        }
        catch (error) {
            this.logger.error('Failed to update connection status:', error);
            throw error;
        }
    }
    async searchConnections(userId, status, createdAfter, createdBefore, limit, offset, sortBy, sortOrder) {
        try {
            const query = {
                userId,
                status,
                createdAfter,
                createdBefore,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.socialService.searchConnections(query);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to search connections:', error);
            throw error;
        }
    }
    async createActivity(userId, activity) {
        try {
            const newActivity = await this.socialService.createActivity(userId, activity);
            return {
                success: true,
                data: newActivity,
            };
        }
        catch (error) {
            this.logger.error('Failed to create activity:', error);
            throw error;
        }
    }
    async searchActivities(userId, type, targetType, targetId, visibility, createdAfter, createdBefore, limit, offset, sortBy, sortOrder) {
        try {
            const query = {
                userId,
                type,
                targetType,
                targetId,
                visibility,
                createdAfter,
                createdBefore,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.socialService.searchActivities(query);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to search activities:', error);
            throw error;
        }
    }
    async createComment(userId, contentId, text, parentId) {
        try {
            const newComment = await this.socialService.createComment(userId, contentId, text, parentId);
            return {
                success: true,
                data: newComment,
            };
        }
        catch (error) {
            this.logger.error('Failed to create comment:', error);
            throw error;
        }
    }
    async updateComment(commentId, userId, text) {
        try {
            const updatedComment = await this.socialService.updateComment(commentId, userId, text);
            return {
                success: true,
                data: updatedComment,
            };
        }
        catch (error) {
            this.logger.error('Failed to update comment:', error);
            throw error;
        }
    }
    async deleteComment(commentId, userId) {
        try {
            await this.socialService.deleteComment(commentId, userId);
            return {
                success: true,
                message: 'Comment deleted successfully',
            };
        }
        catch (error) {
            this.logger.error('Failed to delete comment:', error);
            throw error;
        }
    }
    async toggleReaction(userId, targetType, targetId, type) {
        try {
            const reaction = await this.socialService.toggleReaction(userId, targetType, targetId, type);
            return {
                success: true,
                data: reaction,
            };
        }
        catch (error) {
            this.logger.error('Failed to toggle reaction:', error);
            throw error;
        }
    }
    async createShare(userId, contentId, platform, text) {
        try {
            const newShare = await this.socialService.createShare(userId, contentId, platform, text);
            return {
                success: true,
                data: newShare,
            };
        }
        catch (error) {
            this.logger.error('Failed to create share:', error);
            throw error;
        }
    }
};
exports.SocialController = SocialController;
__decorate([
    (0, common_1.Post)('profiles'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'profile', action: 'create' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Put)('profiles/:userId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'profile', action: 'update' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('profiles/:userId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'profile', action: 'read' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('profiles'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'profile', action: 'list' }),
    __param(0, (0, common_1.Query)('displayName')),
    __param(1, (0, common_1.Query)('location')),
    __param(2, (0, common_1.Query)('createdAfter')),
    __param(3, (0, common_1.Query)('createdBefore')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "searchProfiles", null);
__decorate([
    (0, common_1.Post)('connections'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'connection', action: 'create' }),
    __param(0, (0, common_1.Body)('requesterId')),
    __param(1, (0, common_1.Body)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createConnection", null);
__decorate([
    (0, common_1.Put)('connections/:connectionId/status'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'connection', action: 'update' }),
    __param(0, (0, common_1.Param)('connectionId')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateConnectionStatus", null);
__decorate([
    (0, common_1.Get)('connections'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'connection', action: 'list' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('createdAfter')),
    __param(3, (0, common_1.Query)('createdBefore')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "searchConnections", null);
__decorate([
    (0, common_1.Post)('activities'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'activity', action: 'create' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createActivity", null);
__decorate([
    (0, common_1.Get)('activities'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'activity', action: 'list' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('targetType')),
    __param(3, (0, common_1.Query)('targetId')),
    __param(4, (0, common_1.Query)('visibility')),
    __param(5, (0, common_1.Query)('createdAfter')),
    __param(6, (0, common_1.Query)('createdBefore')),
    __param(7, (0, common_1.Query)('limit')),
    __param(8, (0, common_1.Query)('offset')),
    __param(9, (0, common_1.Query)('sortBy')),
    __param(10, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String, String, String, Date,
        Date, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "searchActivities", null);
__decorate([
    (0, common_1.Post)('comments'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'comment', action: 'create' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('contentId')),
    __param(2, (0, common_1.Body)('text')),
    __param(3, (0, common_1.Body)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createComment", null);
__decorate([
    (0, common_1.Put)('comments/:commentId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'comment', action: 'update' }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Body)('userId')),
    __param(2, (0, common_1.Body)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)('comments/:commentId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'comment', action: 'delete' }),
    __param(0, (0, common_1.Param)('commentId')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)('reactions'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'reaction', action: 'create' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('targetType')),
    __param(2, (0, common_1.Body)('targetId')),
    __param(3, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "toggleReaction", null);
__decorate([
    (0, common_1.Post)('shares'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'share', action: 'create' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('contentId')),
    __param(2, (0, common_1.Body)('platform')),
    __param(3, (0, common_1.Body)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createShare", null);
exports.SocialController = SocialController = SocialController_1 = __decorate([
    (0, common_1.Controller)('social'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof social_service_1.SocialService !== "undefined" && social_service_1.SocialService) === "function" ? _a : Object])
], SocialController);
//# sourceMappingURL=social.controller.js.map