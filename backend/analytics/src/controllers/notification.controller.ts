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
import { NotificationService, CreateNotificationDto, UpdateNotificationDto, NotificationQuery } from '../services/notification.service';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @RequirePermission({ resource: 'notification', action: 'create' })
  async create(@Body() dto: CreateNotificationDto): Promise<{
    success: boolean;
    data: Notification;
  }> {
    try {
      const notification = await this.notificationService.create(dto);
      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  @Put(':id')
  @RequirePermission({ resource: 'notification', action: 'update' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationDto
  ): Promise<{
    success: boolean;
    data: Notification;
  }> {
    try {
      const notification = await this.notificationService.update(id, dto);
      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      this.logger.error('Failed to update notification:', error);
      throw error;
    }
  }

  @Put('read')
  @RequirePermission({ resource: 'notification', action: 'update' })
  async markAsRead(
    @Query('userId') userId: string,
    @Body('ids') ids: string[]
  ): Promise<{
    success: boolean;
  }> {
    try {
      await this.notificationService.markAsRead(userId, ids);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  @Delete()
  @RequirePermission({ resource: 'notification', action: 'delete' })
  async delete(
    @Query('userId') userId: string,
    @Body('ids') ids: string[]
  ): Promise<{
    success: boolean;
  }> {
    try {
      await this.notificationService.delete(userId, ids);
      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to delete notifications:', error);
      throw error;
    }
  }

  @Get(':id')
  @RequirePermission({ resource: 'notification', action: 'read' })
  async findById(@Param('id') id: string): Promise<{
    success: boolean;
    data: Notification | null;
  }> {
    try {
      const notification = await this.notificationService.findById(id);
      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      this.logger.error('Failed to fetch notification:', error);
      throw error;
    }
  }

  @Get()
  @RequirePermission({ resource: 'notification', action: 'read' })
  async findAll(@Query() query: NotificationQuery): Promise<{
    success: boolean;
    data: {
      items: Notification[];
      total: number;
    };
  }> {
    try {
      const result = await this.notificationService.findAll(query);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  @Get('unread/count')
  @RequirePermission({ resource: 'notification', action: 'read' })
  async getUnreadCount(@Query('userId') userId: string): Promise<{
    success: boolean;
    data: {
      count: number;
    };
  }> {
    try {
      const count = await this.notificationService.getUnreadCount(userId);
      return {
        success: true,
        data: {
          count,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get unread count:', error);
      throw error;
    }
  }
} 