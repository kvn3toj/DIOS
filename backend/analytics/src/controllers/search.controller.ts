import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { SearchService, SearchQuery, SearchResult } from '../services/search.service';
import { 
  Content, 
  Profile,
  Activity,
  Comment
} from '../models/social.model';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @Get('content')
  @RequirePermission({ resource: 'content', action: 'read' })
  async searchContent(
    @Query('query') query: string,
    @Query('type') type?: string[],
    @Query('filters') filters?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<{ success: boolean; data: SearchResult<Content> }> {
    try {
      const searchQuery: SearchQuery = {
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
    } catch (error) {
      this.logger.error('Failed to search content:', error);
      throw error;
    }
  }

  @Get('profiles')
  @RequirePermission({ resource: 'profile', action: 'read' })
  async searchProfiles(
    @Query('query') query: string,
    @Query('filters') filters?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<{ success: boolean; data: SearchResult<Profile> }> {
    try {
      const searchQuery: SearchQuery = {
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
    } catch (error) {
      this.logger.error('Failed to search profiles:', error);
      throw error;
    }
  }

  @Get('activities')
  @RequirePermission({ resource: 'activity', action: 'read' })
  async searchActivities(
    @Query('query') query: string,
    @Query('filters') filters?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<{ success: boolean; data: SearchResult<Activity> }> {
    try {
      const searchQuery: SearchQuery = {
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
    } catch (error) {
      this.logger.error('Failed to search activities:', error);
      throw error;
    }
  }

  @Get('comments')
  @RequirePermission({ resource: 'comment', action: 'read' })
  async searchComments(
    @Query('query') query: string,
    @Query('filters') filters?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ): Promise<{ success: boolean; data: SearchResult<Comment> }> {
    try {
      const searchQuery: SearchQuery = {
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
    } catch (error) {
      this.logger.error('Failed to search comments:', error);
      throw error;
    }
  }
} 