import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Content, Profile, Activity, Comment } from '../models/social.model';
export interface SearchQuery {
    query: string;
    type?: string[];
    filters?: Record<string, any>;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface SearchResult<T> {
    total: number;
    items: T[];
    facets?: Record<string, any>;
    suggestions?: string[];
}
export declare class SearchService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    searchContent(query: SearchQuery): Promise<SearchResult<Content>>;
    searchProfiles(query: SearchQuery): Promise<SearchResult<Profile>>;
    searchActivities(query: SearchQuery): Promise<SearchResult<Activity>>;
    searchComments(query: SearchQuery): Promise<SearchResult<Comment>>;
    private createTsQuery;
    private getContentFacets;
    private getSearchSuggestions;
}
