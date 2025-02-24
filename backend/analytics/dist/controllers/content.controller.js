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
var ContentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const content_service_1 = require("../services/content.service");
let ContentController = ContentController_1 = class ContentController {
    constructor(contentService) {
        this.contentService = contentService;
        this.logger = new common_1.Logger(ContentController_1.name);
    }
    async createContent(content, userId) {
        try {
            const newContent = await this.contentService.createContent(content, userId);
            return {
                success: true,
                data: newContent,
            };
        }
        catch (error) {
            this.logger.error('Failed to create content:', error);
            throw error;
        }
    }
    async updateContent(contentId, updates, userId, createNewVersion) {
        try {
            const updatedContent = await this.contentService.updateContent(contentId, updates, userId, createNewVersion);
            return {
                success: true,
                data: updatedContent,
            };
        }
        catch (error) {
            this.logger.error(`Failed to update content ${contentId}:`, error);
            throw error;
        }
    }
    async deleteContent(contentId, userId) {
        try {
            await this.contentService.deleteContent(contentId, userId);
            return {
                success: true,
                message: 'Content deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete content ${contentId}:`, error);
            throw error;
        }
    }
    async getContent(contentId) {
        try {
            const content = await this.contentService.getContent(contentId);
            return {
                success: true,
                data: content,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get content ${contentId}:`, error);
            throw error;
        }
    }
    async searchContent(type, status, author, categories, tags, language, createdAfter, createdBefore, updatedAfter, updatedBefore, publishedAfter, publishedBefore, search, limit, offset, sortBy, sortOrder) {
        try {
            const query = {
                type,
                status,
                author,
                categories,
                tags,
                language,
                createdAfter,
                createdBefore,
                updatedAfter,
                updatedBefore,
                publishedAfter,
                publishedBefore,
                search,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.contentService.searchContent(query);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to search content:', error);
            throw error;
        }
    }
    async publishContent(contentId, userId) {
        try {
            const publishedContent = await this.contentService.publishContent(contentId, userId);
            return {
                success: true,
                data: publishedContent,
            };
        }
        catch (error) {
            this.logger.error(`Failed to publish content ${contentId}:`, error);
            throw error;
        }
    }
    async archiveContent(contentId, userId) {
        try {
            const archivedContent = await this.contentService.archiveContent(contentId, userId);
            return {
                success: true,
                data: archivedContent,
            };
        }
        catch (error) {
            this.logger.error(`Failed to archive content ${contentId}:`, error);
            throw error;
        }
    }
};
exports.ContentController = ContentController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'create' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "createContent", null);
__decorate([
    (0, common_1.Put)(':contentId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'update' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Body)('userId')),
    __param(3, (0, common_1.Query)('createNewVersion')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Delete)(':contentId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'delete' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "deleteContent", null);
__decorate([
    (0, common_1.Get)(':contentId'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'read' }),
    __param(0, (0, common_1.Param)('contentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "getContent", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'list' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('author')),
    __param(3, (0, common_1.Query)('categories')),
    __param(4, (0, common_1.Query)('tags')),
    __param(5, (0, common_1.Query)('language')),
    __param(6, (0, common_1.Query)('createdAfter')),
    __param(7, (0, common_1.Query)('createdBefore')),
    __param(8, (0, common_1.Query)('updatedAfter')),
    __param(9, (0, common_1.Query)('updatedBefore')),
    __param(10, (0, common_1.Query)('publishedAfter')),
    __param(11, (0, common_1.Query)('publishedBefore')),
    __param(12, (0, common_1.Query)('search')),
    __param(13, (0, common_1.Query)('limit')),
    __param(14, (0, common_1.Query)('offset')),
    __param(15, (0, common_1.Query)('sortBy')),
    __param(16, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Array, String, Array, Array, String, Date,
        Date,
        Date,
        Date,
        Date,
        Date, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "searchContent", null);
__decorate([
    (0, common_1.Put)(':contentId/publish'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'publish' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "publishContent", null);
__decorate([
    (0, common_1.Put)(':contentId/archive'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'archive' }),
    __param(0, (0, common_1.Param)('contentId')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ContentController.prototype, "archiveContent", null);
exports.ContentController = ContentController = ContentController_1 = __decorate([
    (0, common_1.Controller)('content'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentController);
//# sourceMappingURL=content.controller.js.map