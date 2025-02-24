import { ContentService } from '../services/content.service';
import { Content, ContentType, ContentStatus } from '../models/content.model';
export declare class ContentController {
    private readonly contentService;
    private readonly logger;
    constructor(contentService: ContentService);
    createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>, userId: string): Promise<{
        success: boolean;
        data: Content;
    }>;
    updateContent(contentId: string, updates: Partial<Content>, userId: string, createNewVersion?: boolean): Promise<{
        success: boolean;
        data: Content;
    }>;
    deleteContent(contentId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getContent(contentId: string): Promise<{
        success: boolean;
        data: Content;
    }>;
    searchContent(type?: ContentType[], status?: ContentStatus[], author?: string, categories?: string[], tags?: string[], language?: string, createdAfter?: Date, createdBefore?: Date, updatedAfter?: Date, updatedBefore?: Date, publishedAfter?: Date, publishedBefore?: Date, search?: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: {
            total: number;
            items: Content[];
        };
    }>;
    publishContent(contentId: string, userId: string): Promise<{
        success: boolean;
        data: Content;
    }>;
    archiveContent(contentId: string, userId: string): Promise<{
        success: boolean;
        data: Content;
    }>;
}
