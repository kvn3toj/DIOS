import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Logger 
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { ContentService } from '../services/content.service';
import { 
  Content, 
  ContentType, 
  ContentStatus, 
  ContentSearchQuery 
} from '../models/content.model';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(private readonly contentService: ContentService) {}

  @Post()
  @RequirePermission({ resource: 'content', action: 'create' })
  async createContent(
    @Body() content: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versions'>,
    @Body('userId') userId: string
  ) {
    try {
      const newContent = await this.contentService.createContent(content, userId);
      return {
        success: true,
        data: newContent,
      };
    } catch (error) {
      this.logger.error('Failed to create content:', error);
      throw error;
    }
  }

  @Put(':contentId')
  @RequirePermission({ resource: 'content', action: 'update' })
  async updateContent(
    @Param('contentId') contentId: string,
    @Body() updates: Partial<Content>,
    @Body('userId') userId: string,
    @Query('createNewVersion') createNewVersion?: boolean
  ) {
    try {
      const updatedContent = await this.contentService.updateContent(
        contentId,
        updates,
        userId,
        createNewVersion
      );
      return {
        success: true,
        data: updatedContent,
      };
    } catch (error) {
      this.logger.error(`Failed to update content ${contentId}:`, error);
      throw error;
    }
  }

  @Delete(':contentId')
  @RequirePermission({ resource: 'content', action: 'delete' })
  async deleteContent(
    @Param('contentId') contentId: string,
    @Body('userId') userId: string
  ) {
    try {
      await this.contentService.deleteContent(contentId, userId);
      return {
        success: true,
        message: 'Content deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete content ${contentId}:`, error);
      throw error;
    }
  }

  @Get(':contentId')
  @RequirePermission({ resource: 'content', action: 'read' })
  async getContent(@Param('contentId') contentId: string) {
    try {
      const content = await this.contentService.getContent(contentId);
      return {
        success: true,
        data: content,
      };
    } catch (error) {
      this.logger.error(`Failed to get content ${contentId}:`, error);
      throw error;
    }
  }

  @Get()
  @RequirePermission({ resource: 'content', action: 'list' })
  async searchContent(
    @Query('type') type?: ContentType[],
    @Query('status') status?: ContentStatus[],
    @Query('author') author?: string,
    @Query('categories') categories?: string[],
    @Query('tags') tags?: string[],
    @Query('language') language?: string,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('updatedAfter') updatedAfter?: Date,
    @Query('updatedBefore') updatedBefore?: Date,
    @Query('publishedAfter') publishedAfter?: Date,
    @Query('publishedBefore') publishedBefore?: Date,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    try {
      const query: ContentSearchQuery = {
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
    } catch (error) {
      this.logger.error('Failed to search content:', error);
      throw error;
    }
  }

  @Put(':contentId/publish')
  @RequirePermission({ resource: 'content', action: 'publish' })
  async publishContent(
    @Param('contentId') contentId: string,
    @Body('userId') userId: string
  ) {
    try {
      const publishedContent = await this.contentService.publishContent(contentId, userId);
      return {
        success: true,
        data: publishedContent,
      };
    } catch (error) {
      this.logger.error(`Failed to publish content ${contentId}:`, error);
      throw error;
    }
  }

  @Put(':contentId/archive')
  @RequirePermission({ resource: 'content', action: 'archive' })
  async archiveContent(
    @Param('contentId') contentId: string,
    @Body('userId') userId: string
  ) {
    try {
      const archivedContent = await this.contentService.archiveContent(contentId, userId);
      return {
        success: true,
        data: archivedContent,
      };
    } catch (error) {
      this.logger.error(`Failed to archive content ${contentId}:`, error);
      throw error;
    }
  }
} 