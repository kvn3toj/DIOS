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
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { SocialService } from '../services/social.service';
import {
  Profile,
  Connection,
  Activity,
  Comment,
  Reaction,
  Share,
  ConnectionStatus,
  ActivityType,
  ReactionType,
  ProfileSearchQuery,
  ConnectionSearchQuery,
  ActivitySearchQuery,
} from '../models/social.model';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  private readonly logger = new Logger(SocialController.name);

  constructor(private readonly socialService: SocialService) {}

  // Profile endpoints
  @Post('profiles')
  @RequirePermission({ resource: 'profile', action: 'create' })
  async createProfile(
    @Body('userId') userId: string,
    @Body() profile: Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'stats'>
  ) {
    try {
      const newProfile = await this.socialService.createProfile(userId, profile);
      return {
        success: true,
        data: newProfile,
      };
    } catch (error) {
      this.logger.error('Failed to create profile:', error);
      throw error;
    }
  }

  @Put('profiles/:userId')
  @RequirePermission({ resource: 'profile', action: 'update' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updates: Partial<Profile>
  ) {
    try {
      const updatedProfile = await this.socialService.updateProfile(userId, updates);
      return {
        success: true,
        data: updatedProfile,
      };
    } catch (error) {
      this.logger.error('Failed to update profile:', error);
      throw error;
    }
  }

  @Get('profiles/:userId')
  @RequirePermission({ resource: 'profile', action: 'read' })
  async getProfile(@Param('userId') userId: string) {
    try {
      const profile = await this.socialService.getProfile(userId);
      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      this.logger.error('Failed to get profile:', error);
      throw error;
    }
  }

  @Get('profiles')
  @RequirePermission({ resource: 'profile', action: 'list' })
  async searchProfiles(
    @Query('displayName') displayName?: string,
    @Query('location') location?: string,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    try {
      const query: ProfileSearchQuery = {
        displayName,
        location,
        createdAfter,
        createdBefore,
        limit,
        offset,
        sortBy,
        sortOrder,
      };

      const result = await this.socialService.searchProfiles(query);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to search profiles:', error);
      throw error;
    }
  }

  // Connection endpoints
  @Post('connections')
  @RequirePermission({ resource: 'connection', action: 'create' })
  async createConnection(
    @Body('requesterId') requesterId: string,
    @Body('recipientId') recipientId: string
  ) {
    try {
      const newConnection = await this.socialService.createConnection(requesterId, recipientId);
      return {
        success: true,
        data: newConnection,
      };
    } catch (error) {
      this.logger.error('Failed to create connection:', error);
      throw error;
    }
  }

  @Put('connections/:connectionId/status')
  @RequirePermission({ resource: 'connection', action: 'update' })
  async updateConnectionStatus(
    @Param('connectionId') connectionId: string,
    @Body('userId') userId: string,
    @Body('status') status: ConnectionStatus
  ) {
    try {
      const updatedConnection = await this.socialService.updateConnectionStatus(connectionId, userId, status);
      return {
        success: true,
        data: updatedConnection,
      };
    } catch (error) {
      this.logger.error('Failed to update connection status:', error);
      throw error;
    }
  }

  @Get('connections')
  @RequirePermission({ resource: 'connection', action: 'list' })
  async searchConnections(
    @Query('userId') userId?: string,
    @Query('status') status?: ConnectionStatus,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    try {
      const query: ConnectionSearchQuery = {
        userId,
        status,
        createdAfter,
        createdBefore,
        limit,
        offset,
        sortBy,
        sortOrder,
      };

      const result = await this.socialService.searchConnections(query);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to search connections:', error);
      throw error;
    }
  }

  // Activity endpoints
  @Post('activities')
  @RequirePermission({ resource: 'activity', action: 'create' })
  async createActivity(
    @Body('userId') userId: string,
    @Body() activity: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      const newActivity = await this.socialService.createActivity(userId, activity);
      return {
        success: true,
        data: newActivity,
      };
    } catch (error) {
      this.logger.error('Failed to create activity:', error);
      throw error;
    }
  }

  @Get('activities')
  @RequirePermission({ resource: 'activity', action: 'list' })
  async searchActivities(
    @Query('userId') userId?: string,
    @Query('type') type?: ActivityType[],
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('visibility') visibility?: string,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    try {
      const query: ActivitySearchQuery = {
        userId,
        type,
        targetType,
        targetId,
        visibility,
        createdAfter,
        createdBefore,
        limit,
        offset,
        sortBy,
        sortOrder,
      };

      const result = await this.socialService.searchActivities(query);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to search activities:', error);
      throw error;
    }
  }

  // Comment endpoints
  @Post('comments')
  @RequirePermission({ resource: 'comment', action: 'create' })
  async createComment(
    @Body('userId') userId: string,
    @Body('contentId') contentId: string,
    @Body('text') text: string,
    @Body('parentId') parentId?: string
  ) {
    try {
      const newComment = await this.socialService.createComment(userId, contentId, text, parentId);
      return {
        success: true,
        data: newComment,
      };
    } catch (error) {
      this.logger.error('Failed to create comment:', error);
      throw error;
    }
  }

  @Put('comments/:commentId')
  @RequirePermission({ resource: 'comment', action: 'update' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body('userId') userId: string,
    @Body('text') text: string
  ) {
    try {
      const updatedComment = await this.socialService.updateComment(commentId, userId, text);
      return {
        success: true,
        data: updatedComment,
      };
    } catch (error) {
      this.logger.error('Failed to update comment:', error);
      throw error;
    }
  }

  @Delete('comments/:commentId')
  @RequirePermission({ resource: 'comment', action: 'delete' })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Body('userId') userId: string
  ) {
    try {
      await this.socialService.deleteComment(commentId, userId);
      return {
        success: true,
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      this.logger.error('Failed to delete comment:', error);
      throw error;
    }
  }

  // Reaction endpoints
  @Post('reactions')
  @RequirePermission({ resource: 'reaction', action: 'create' })
  async toggleReaction(
    @Body('userId') userId: string,
    @Body('targetType') targetType: string,
    @Body('targetId') targetId: string,
    @Body('type') type: ReactionType
  ) {
    try {
      const reaction = await this.socialService.toggleReaction(userId, targetType, targetId, type);
      return {
        success: true,
        data: reaction,
      };
    } catch (error) {
      this.logger.error('Failed to toggle reaction:', error);
      throw error;
    }
  }

  // Share endpoints
  @Post('shares')
  @RequirePermission({ resource: 'share', action: 'create' })
  async createShare(
    @Body('userId') userId: string,
    @Body('contentId') contentId: string,
    @Body('platform') platform: string,
    @Body('text') text?: string
  ) {
    try {
      const newShare = await this.socialService.createShare(userId, contentId, platform, text);
      return {
        success: true,
        data: newShare,
      };
    } catch (error) {
      this.logger.error('Failed to create share:', error);
      throw error;
    }
  }
} 