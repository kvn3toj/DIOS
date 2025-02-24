import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from '../security/services/audit-log.service';
import { 
  Content, 
  ContentType, 
  ContentStatus, 
  ContentMetadata, 
  ContentVersion,
  ContentSearchQuery,
  ContentPermissions 
} from '../models/content.model';
import { slugify } from '../utils/string.utils';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createContent(
    content: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>,
    userId: string
  ): Promise<Content> {
    try {
      // Generate slug from title if not provided
      const slug = content.slug || slugify(content.metadata.title);

      // Check for slug uniqueness
      const existingContent = await this.prisma.content.findUnique({
        where: { slug },
      });

      if (existingContent) {
        throw new ConflictException('Content with this slug already exists');
      }

      // Create initial version
      const initialVersion: Omit<ContentVersion, 'id'> = {
        contentId: '', // Will be set after content creation
        version: 1,
        content: content.content,
        metadata: content.metadata,
        createdAt: new Date(),
        createdBy: userId,
        changelog: 'Initial version',
      };

      // Create content with initial version
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

      // Emit content created event
      this.eventEmitter.emit('content.created', {
        contentId: newContent.id,
        userId,
        type: content.type,
      });

      // Log audit event
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
    } catch (error) {
      this.logger.error('Failed to create content:', error);
      throw error;
    }
  }

  async updateContent(
    contentId: string,
    updates: Partial<Content>,
    userId: string,
    createNewVersion: boolean = true
  ): Promise<Content> {
    try {
      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
        include: { versions: true },
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      // If slug is being updated, check for uniqueness
      if (updates.slug && updates.slug !== content.slug) {
        const existingContent = await this.prisma.content.findUnique({
          where: { slug: updates.slug },
        });

        if (existingContent) {
          throw new ConflictException('Content with this slug already exists');
        }
      }

      let updatedContent;

      if (createNewVersion) {
        // Create new version
        const newVersion: Omit<ContentVersion, 'id'> = {
          contentId,
          version: content.currentVersion + 1,
          content: updates.content || content.content,
          metadata: updates.metadata || content.metadata,
          createdAt: new Date(),
          createdBy: userId,
          changelog: updates.changelog || `Version ${content.currentVersion + 1}`,
        };

        // Update content with new version
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
      } else {
        // Update content without creating new version
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

      // Emit content updated event
      this.eventEmitter.emit('content.updated', {
        contentId,
        userId,
        type: content.type,
        createNewVersion,
      });

      // Log audit event
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
    } catch (error) {
      this.logger.error(`Failed to update content ${contentId}:`, error);
      throw error;
    }
  }

  async deleteContent(contentId: string, userId: string): Promise<void> {
    try {
      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      // Delete content and all its versions
      await this.prisma.content.delete({
        where: { id: contentId },
      });

      // Emit content deleted event
      this.eventEmitter.emit('content.deleted', {
        contentId,
        userId,
        type: content.type,
      });

      // Log audit event
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
    } catch (error) {
      this.logger.error(`Failed to delete content ${contentId}:`, error);
      throw error;
    }
  }

  async getContent(contentId: string): Promise<Content> {
    try {
      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
        include: {
          versions: true,
        },
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      return content;
    } catch (error) {
      this.logger.error(`Failed to get content ${contentId}:`, error);
      throw error;
    }
  }

  async searchContent(query: ContentSearchQuery): Promise<{ total: number; items: Content[] }> {
    try {
      const where: any = {};

      // Apply filters
      if (query.type?.length) where.type = { in: query.type };
      if (query.status?.length) where.status = { in: query.status };
      if (query.author) where.createdBy = query.author;
      if (query.categories?.length) where.metadata = { categories: { hasAny: query.categories } };
      if (query.tags?.length) where.metadata = { tags: { hasAny: query.tags } };
      if (query.language) where.metadata = { language: query.language };

      // Date filters
      if (query.createdAfter || query.createdBefore) {
        where.createdAt = {};
        if (query.createdAfter) where.createdAt.gte = query.createdAfter;
        if (query.createdBefore) where.createdAt.lte = query.createdBefore;
      }

      if (query.updatedAfter || query.updatedBefore) {
        where.updatedAt = {};
        if (query.updatedAfter) where.updatedAt.gte = query.updatedAfter;
        if (query.updatedBefore) where.updatedAt.lte = query.updatedBefore;
      }

      if (query.publishedAfter || query.publishedBefore) {
        where.publishedAt = {};
        if (query.publishedAfter) where.publishedAt.gte = query.publishedAfter;
        if (query.publishedBefore) where.publishedAt.lte = query.publishedBefore;
      }

      // Full-text search
      if (query.search) {
        where.OR = [
          { metadata: { title: { contains: query.search, mode: 'insensitive' } } },
          { metadata: { description: { contains: query.search, mode: 'insensitive' } } },
          { content: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      // Get total count
      const total = await this.prisma.content.count({ where });

      // Get content with pagination and sorting
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
    } catch (error) {
      this.logger.error('Failed to search content:', error);
      throw error;
    }
  }

  async publishContent(contentId: string, userId: string): Promise<Content> {
    try {
      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      const updatedContent = await this.prisma.content.update({
        where: { id: contentId },
        data: {
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
          publishedBy: userId,
          updatedAt: new Date(),
          updatedBy: userId,
        },
        include: {
          versions: true,
        },
      });

      // Emit content published event
      this.eventEmitter.emit('content.published', {
        contentId,
        userId,
        type: content.type,
      });

      // Log audit event
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
    } catch (error) {
      this.logger.error(`Failed to publish content ${contentId}:`, error);
      throw error;
    }
  }

  async archiveContent(contentId: string, userId: string): Promise<Content> {
    try {
      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      const updatedContent = await this.prisma.content.update({
        where: { id: contentId },
        data: {
          status: ContentStatus.ARCHIVED,
          updatedAt: new Date(),
          updatedBy: userId,
        },
        include: {
          versions: true,
        },
      });

      // Emit content archived event
      this.eventEmitter.emit('content.archived', {
        contentId,
        userId,
        type: content.type,
      });

      // Log audit event
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
    } catch (error) {
      this.logger.error(`Failed to archive content ${contentId}:`, error);
      throw error;
    }
  }
} 