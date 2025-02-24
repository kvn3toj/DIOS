import { SearchService, SearchResult } from '../services/search.service';
import { Content, Profile, Activity, Comment } from '../models/social.model';
export declare class SearchController {
    private readonly searchService;
    private readonly logger;
    constructor(searchService: SearchService);
    searchContent(query: string, type?: string[], filters?: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: SearchResult<Content>;
    }>;
    searchProfiles(query: string, filters?: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: SearchResult<Profile>;
    }>;
    searchActivities(query: string, filters?: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: SearchResult<Activity>;
    }>;
    searchComments(query: string, filters?: string, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: SearchResult<Comment>;
    }>;
}
