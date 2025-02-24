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
var ContentService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const audit_log_service_1 = require("../security/services/audit-log.service");
const content_model_1 = require("../models/content.model");
const string_utils_1 = require("../utils/string.utils");
let ContentService = ContentService_1 = class ContentService {
    constructor(prisma, eventEmitter, auditLogService) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.auditLogService = auditLogService;
        this.logger = new common_1.Logger(ContentService_1.name);
    }
    async createContent(content, userId) {
        try {
            const slug = content.slug || (0, string_utils_1.slugify)(content.metadata.title);
            const existingContent = await this.prisma.content.findUnique({
                where: { slug },
            });
            if (existingContent) {
                throw new common_1.ConflictException('Content with this slug already exists');
            }
            const initialVersion = {
                contentId: '',
                version: 1,
                content: content.content,
                metadata: content.metadata,
                createdAt: new Date(),
                createdBy: userId,
                changelog: 'Initial version',
            };
            const newContent = await this.prisma.content.create({
                data: {
                    ...content,
                    slug,
                    currentVersion: 1,
                    createdBy: userId,
                    updatedBy: userId,
                    versions: {
                        create: initialVersion,
                    },
                },
                include: {
                    versions: true,
                },
            });
            this.eventEmitter.emit('content.created', {
                contentId: newContent.id,
                userId,
                type: content.type,
            });
            await this.auditLogService.logAuditEvent({
                userId,
                eventType: 'content.create',
                resourceType: 'content',
                resourceId: newContent.id,
                action: 'create',
                status: 'success',
                details: {
                    type: content.type,
                    title: content.metadata.title,
                },
            });
            return newContent;
        }
        catch (error) {
            this.logger.error('Failed to create content:', error);
            throw error;
        }
    }
    async updateContent(contentId, updates, userId, createNewVersion = true) {
        try {
            const content = await this.prisma.content.findUnique({
                where: { id: contentId },
                include: { versions: true },
            });
            if (!content) {
                throw new common_1.NotFoundException('Content not found');
            }
            if (updates.slug && updates.slug !== content.slug) {
                const existingContent = await this.prisma.content.findUnique({
                    where: { slug: updates.slug },
                });
                if (existingContent) {
                    throw new common_1.ConflictException('Content with this slug already exists');
                }
            }
            let updatedContent;
            if (createNewVersion) {
                const newVersion = {
                    contentId,
                    version: content.currentVersion + 1,
                    content: updates.content || content.content,
                    metadata: updates.metadata || content.metadata,
                    createdAt: new Date(),
                    createdBy: userId,
                    changelog: updates.changelog || `Version ${content.currentVersion + 1}`,
                };
                updatedContent = await this.prisma.content.update({
                    where: { id: contentId },
                    data: {
                        ...updates,
                        currentVersion: content.currentVersion + 1,
                        updatedBy: userId,
                        updatedAt: new Date(),
                        versions: {
                            create: newVersion,
                        },
                    },
                    include: {
                        versions: true,
                    },
                });
            }
            else {
                updatedContent = await this.prisma.content.update({
                    where: { id: contentId },
                    data: {
                        ...updates,
                        updatedBy: userId,
                        updatedAt: new Date(),
                    },
                    include: {
                        versions: true,
                    },
                });
            }
            this.eventEmitter.emit('content.updated', {
                contentId,
                userId,
                type: content.type,
                createNewVersion,
            });
            await this.auditLogService.logAuditEvent({
                userId,
                eventType: 'content.update',
                resourceType: 'content',
                resourceId: contentId,
                action: 'update',
                status: 'success',
                details: {
                    type: content.type,
                    title: content.metadata.title,
                    createNewVersion,
                },
            });
            return updatedContent;
        }
        catch (error) {
            this.logger.error(`Failed to update content ${contentId}:`, error);
            throw error;
        }
    }
    async deleteContent(contentId, userId) {
        try {
            const content = await this.prisma.content.findUnique({
                where: { id: contentId },
            });
            if (!content) {
                throw new common_1.NotFoundException('Content not found');
            }
            await this.prisma.content.delete({
                where: { id: contentId },
            });
            this.eventEmitter.emit('content.deleted', {
                contentId,
                userId,
                type: content.type,
            });
            await this.auditLogService.logAuditEvent({
                userId,
                eventType: 'content.delete',
                resourceType: 'content',
                resourceId: contentId,
                action: 'delete',
                status: 'success',
                details: {
                    type: content.type,
                    title: content.metadata.title,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to delete content ${contentId}:`, error);
            throw error;
        }
    }
    async getContent(contentId) {
        try {
            const content = await this.prisma.content.findUnique({
                where: { id: contentId },
                include: {
                    versions: true,
                },
            });
            if (!content) {
                throw new common_1.NotFoundException('Content not found');
            }
            return content;
        }
        catch (error) {
            this.logger.error(`Failed to get content ${contentId}:`, error);
            throw error;
        }
    }
    async searchContent(query) {
        try {
            const where = {};
            if (query.type?.length)
                where.type = { in: query.type };
            if (query.status?.length)
                where.status = { in: query.status };
            if (query.author)
                where.createdBy = query.author;
            if (query.categories?.length)
                where.metadata = { categories: { hasAny: query.categories } };
            if (query.tags?.length)
                where.metadata = { tags: { hasAny: query.tags } };
            if (query.language)
                where.metadata = { language: query.language };
            if (query.createdAfter || query.createdBefore) {
                where.createdAt = {};
                if (query.createdAfter)
                    where.createdAt.gte = query.createdAfter;
                if (query.createdBefore)
                    where.createdAt.lte = query.createdBefore;
            }
            if (query.updatedAfter || query.updatedBefore) {
                where.updatedAt = {};
                if (query.updatedAfter)
                    where.updatedAt.gte = query.updatedAfter;
                if (query.updatedBefore)
                    where.updatedAt.lte = query.updatedBefore;
            }
            if (query.publishedAfter || query.publishedBefore) {
                where.publishedAt = {};
                if (query.publishedAfter)
                    where.publishedAt.gte = query.publishedAfter;
                if (query.publishedBefore)
                    where.publishedAt.lte = query.publishedBefore;
            }
            if (query.search) {
                where.OR = [
                    { metadata: { title: { contains: query.search, mode: 'insensitive' } } },
                    { metadata: { description: { contains: query.search, mode: 'insensitive' } } },
                    { content: { contains: query.search, mode: 'insensitive' } },
                ];
            }
            const total = await this.prisma.content.count({ where });
            const items = await this.prisma.content.findMany({
                where,
                include: {
                    versions: true,
                },
                take: query.limit || 50,
                skip: query.offset || 0,
                orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { updatedAt: 'desc' },
            });
            return { total, items };
        }
        catch (error) {
            this.logger.error('Failed to search content:', error);
            throw error;
        }
    }
    async publishContent(contentId, userId) {
        try {
            const content = await this.prisma.content.findUnique({
                where: { id: contentId },
            });
            if (!content) {
                throw new common_1.NotFoundException('Content not found');
            }
            const updatedContent = await this.prisma.content.update({
                where: { id: contentId },
                data: {
                    status: content_model_1.ContentStatus.PUBLISHED,
                    publishedAt: new Date(),
                    publishedBy: userId,
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
                include: {
                    versions: true,
                },
            });
            this.eventEmitter.emit('content.published', {
                contentId,
                userId,
                type: content.type,
            });
            await this.auditLogService.logAuditEvent({
                userId,
                eventType: 'content.publish',
                resourceType: 'content',
                resourceId: contentId,
                action: 'publish',
                status: 'success',
                details: {
                    type: content.type,
                    title: content.metadata.title,
                },
            });
            return updatedContent;
        }
        catch (error) {
            this.logger.error(`Failed to publish content ${contentId}:`, error);
            throw error;
        }
    }
    async archiveContent(contentId, userId) {
        try {
            const content = await this.prisma.content.findUnique({
                where: { id: contentId },
            });
            if (!content) {
                throw new common_1.NotFoundException('Content not found');
            }
            const updatedContent = await this.prisma.content.update({
                where: { id: contentId },
                data: {
                    status: content_model_1.ContentStatus.ARCHIVED,
                    updatedAt: new Date(),
                    updatedBy: userId,
                },
                include: {
                    versions: true,
                },
            });
            this.eventEmitter.emit('content.archived', {
                contentId,
                userId,
                type: content.type,
            });
            await this.auditLogService.logAuditEvent({
                userId,
                eventType: 'content.archive',
                resourceType: 'content',
                resourceId: contentId,
                action: 'archive',
                status: 'success',
                details: {
                    type: content.type,
                    title: content.metadata.title,
                },
            });
            return updatedContent;
        }
        catch (error) {
            this.logger.error(`Failed to archive content ${contentId}:`, error);
            throw error;
        }
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object, audit_log_service_1.AuditLogService])
], ContentService);
//# sourceMappingURL=content.service.js.map