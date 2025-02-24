import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from '../security/services/audit-log.service';
import { Content, ContentSearchQuery } from '../models/content.model';
export declare class ContentService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly auditLogService;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, auditLogService: AuditLogService);
    createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>, userId: string): Promise<Content>;
    updateContent(contentId: string, updates: Partial<Content>, userId: string, createNewVersion?: boolean): Promise<Content>;
    deleteContent(contentId: string, userId: string): Promise<void>;
    getContent(contentId: string): Promise<Content>;
    searchContent(query: ContentSearchQuery): Promise<{
        total: number;
        items: Content[];
    }>;
    publishContent(contentId: string, userId: string): Promise<Content>;
    archiveContent(contentId: string, userId: string): Promise<Content>;
}
