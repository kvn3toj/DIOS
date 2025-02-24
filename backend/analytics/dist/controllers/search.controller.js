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
var SearchController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../security/guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../security/decorators/require-permission.decorator");
const search_service_1 = require("../services/search.service");
let SearchController = SearchController_1 = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
        this.logger = new common_1.Logger(SearchController_1.name);
    }
    async searchContent(query, type, filters, limit, offset, sortBy, sortOrder) {
        try {
            const searchQuery = {
                query,
                type,
                filters: filters ? JSON.parse(filters) : undefined,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.searchService.searchContent(searchQuery);
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
    async searchProfiles(query, filters, limit, offset, sortBy, sortOrder) {
        try {
            const searchQuery = {
                query,
                filters: filters ? JSON.parse(filters) : undefined,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.searchService.searchProfiles(searchQuery);
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
    async searchActivities(query, filters, limit, offset, sortBy, sortOrder) {
        try {
            const searchQuery = {
                query,
                filters: filters ? JSON.parse(filters) : undefined,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.searchService.searchActivities(searchQuery);
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
    async searchComments(query, filters, limit, offset, sortBy, sortOrder) {
        try {
            const searchQuery = {
                query,
                filters: filters ? JSON.parse(filters) : undefined,
                limit,
                offset,
                sortBy,
                sortOrder,
            };
            const result = await this.searchService.searchComments(searchQuery);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to search comments:', error);
            throw error;
        }
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('content'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'content', action: 'read' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('filters')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchContent", null);
__decorate([
    (0, common_1.Get)('profiles'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'profile', action: 'read' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('filters')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchProfiles", null);
__decorate([
    (0, common_1.Get)('activities'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'activity', action: 'read' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('filters')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchActivities", null);
__decorate([
    (0, common_1.Get)('comments'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'comment', action: 'read' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('filters')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchComments", null);
exports.SearchController = SearchController = SearchController_1 = __decorate([
    (0, common_1.Controller)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map