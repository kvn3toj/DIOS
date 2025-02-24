import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { 
  Content, 
  ContentType, 
  ContentStatus,
  Profile,
  Connection,
  Activity,
  Comment,
  Reaction,
  Share
} from '../models/social.model';

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

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async searchContent(query: SearchQuery): Promise<SearchResult<Content>> {
    try {
      const where: any = {};

      // Full-text search using tsvector
      if (query.query) {
        where.searchVector = {
          matches: this.createTsQuery(query.query)
        };
      }

      // Apply filters
      if (query.type) {
        where.type = { in: query.type };
      }

      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            where[key] = { in: value };
          } else if (typeof value === 'object') {
            where[key] = value;
          } else {
            where[key] = { equals: value };
          }
        });
      }

      // Get total count
      const total = await this.prisma.content.count({ where });

      // Get content with pagination and sorting
      const items = await this.prisma.content.findMany({
        where,
        take: query.limit || 50,
        skip: query.offset || 0,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { updatedAt: 'desc' },
        include: {
          versions: true,
          creator: true,
          updater: true,
          publisher: true
        }
      });

      // Get facets
      const facets = await this.getContentFacets(where);

      // Get search suggestions
      const suggestions = query.query ? await this.getSearchSuggestions(query.query) : [];

      return { total, items, facets, suggestions };
    } catch (error) {
      this.logger.error('Failed to search content:', error);
      throw error;
    }
  }

  async searchProfiles(query: SearchQuery): Promise<SearchResult<Profile>> {
    try {
      const where: any = {};

      // Full-text search
      if (query.query) {
        where.OR = [
          { displayName: { contains: query.query, mode: 'insensitive' } },
          { bio: { contains: query.query, mode: 'insensitive' } },
          { location: { contains: query.query, mode: 'insensitive' } }
        ];
      }

      // Apply filters
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            where[key] = { in: value };
          } else if (typeof value === 'object') {
            where[key] = value;
          } else {
            where[key] = { equals: value };
          }
        });
      }

      // Get total count
      const total = await this.prisma.profile.count({ where });

      // Get profiles with pagination and sorting
      const items = await this.prisma.profile.findMany({
        where,
        take: query.limit || 50,
        skip: query.offset || 0,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { createdAt: 'desc' },
        include: {
          user: true
        }
      });

      return { total, items };
    } catch (error) {
      this.logger.error('Failed to search profiles:', error);
      throw error;
    }
  }

  async searchActivities(query: SearchQuery): Promise<SearchResult<Activity>> {
    try {
      const where: any = {};

      // Full-text search
      if (query.query) {
        where.OR = [
          { 'data.text': { contains: query.query, mode: 'insensitive' } }
        ];
      }

      // Apply filters
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            where[key] = { in: value };
          } else if (typeof value === 'object') {
            where[key] = value;
          } else {
            where[key] = { equals: value };
          }
        });
      }

      // Get total count
      const total = await this.prisma.activity.count({ where });

      // Get activities with pagination and sorting
      const items = await this.prisma.activity.findMany({
        where,
        take: query.limit || 50,
        skip: query.offset || 0,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { createdAt: 'desc' },
        include: {
          user: true
        }
      });

      return { total, items };
    } catch (error) {
      this.logger.error('Failed to search activities:', error);
      throw error;
    }
  }

  async searchComments(query: SearchQuery): Promise<SearchResult<Comment>> {
    try {
      const where: any = {};

      // Full-text search
      if (query.query) {
        where.text = { contains: query.query, mode: 'insensitive' };
      }

      // Apply filters
      if (query.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            where[key] = { in: value };
          } else if (typeof value === 'object') {
            where[key] = value;
          } else {
            where[key] = { equals: value };
          }
        });
      }

      // Get total count
      const total = await this.prisma.comment.count({ where });

      // Get comments with pagination and sorting
      const items = await this.prisma.comment.findMany({
        where,
        take: query.limit || 50,
        skip: query.offset || 0,
        orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : { createdAt: 'desc' },
        include: {
          user: true,
          content: true,
          parent: true,
          replies: true
        }
      });

      return { total, items };
    } catch (error) {
      this.logger.error('Failed to search comments:', error);
      throw error;
    }
  }

  private createTsQuery(query: string): string {
    // Convert the query into a PostgreSQL tsquery format
    return query
      .trim()
      .split(/\s+/)
      .map(term => `${term}:*`)
      .join(' & ');
  }

  private async getContentFacets(where: any): Promise<Record<string, any>> {
    const [types, statuses, categories, tags] = await Promise.all([
      this.prisma.content.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      this.prisma.content.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      this.prisma.content.groupBy({
        by: ['metadata'],
        where: {
          ...where,
          metadata: { path: ['categories'] }
        },
        _count: true
      }),
      this.prisma.content.groupBy({
        by: ['metadata'],
        where: {
          ...where,
          metadata: { path: ['tags'] }
        },
        _count: true
      })
    ]);

    return {
      types: types.reduce((acc, { type, _count }) => ({ ...acc, [type]: _count }), {}),
      statuses: statuses.reduce((acc, { status, _count }) => ({ ...acc, [status]: _count }), {}),
      categories: categories.reduce((acc, { metadata, _count }) => ({ ...acc, [metadata.categories]: _count }), {}),
      tags: tags.reduce((acc, { metadata, _count }) => ({ ...acc, [metadata.tags]: _count }), {})
    };
  }

  private async getSearchSuggestions(query: string): Promise<string[]> {
    // Get similar terms from recent searches and popular content
    const suggestions = await this.prisma.$queryRaw`
      SELECT word, similarity(word, ${query}) as sml
      FROM ts_stat('SELECT to_tsvector(''simple'', metadata::text) FROM content')
      WHERE word % ${query}
      ORDER BY sml DESC, word
      LIMIT 5;
    `;

    return suggestions.map((s: any) => s.word);
  }
} 