import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  User
} from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  expiresAt?: Date;
}

export interface UpdateNotificationDto {
  status?: NotificationStatus;
  readAt?: Date;
}

export interface NotificationQuery {
  userId: string;
  type?: NotificationType[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
})
export class NotificationService {
  @WebSocketServer()
  private server: Server;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          content: dto.content,
          data: dto.data,
          priority: dto.priority || NotificationPriority.LOW,
          expiresAt: dto.expiresAt
        },
        include: {
          user: true
        }
      });

      // Emit event for real-time updates
      this.eventEmitter.emit('notification.created', notification);
      
      // Send notification through WebSocket
      this.server.to(dto.userId).emit('notification', {
        type: 'NEW_NOTIFICATION',
        data: notification
      });

      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateNotificationDto): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.update({
        where: { id },
        data: {
          status: dto.status,
          readAt: dto.status === NotificationStatus.READ ? new Date() : dto.readAt
        },
        include: {
          user: true
        }
      });

      // Emit event for real-time updates
      this.eventEmitter.emit('notification.updated', notification);

      return notification;
    } catch (error) {
      this.logger.error('Failed to update notification:', error);
      throw error;
    }
  }

  async markAsRead(userId: string, ids: string[]): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId
        },
        data: {
          status: NotificationStatus.READ,
          readAt: new Date()
        }
      });

      // Emit event for real-time updates
      this.eventEmitter.emit('notification.read', { userId, ids });

      // Send update through WebSocket
      this.server.to(userId).emit('notification', {
        type: 'NOTIFICATIONS_READ',
        data: { ids }
      });
    } catch (error) {
      this.logger.error('Failed to mark notifications as read:', error);
      throw error;
    }
  }

  async delete(userId: string, ids: string[]): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId
        },
        data: {
          status: NotificationStatus.DELETED
        }
      });

      // Emit event for real-time updates
      this.eventEmitter.emit('notification.deleted', { userId, ids });

      // Send update through WebSocket
      this.server.to(userId).emit('notification', {
        type: 'NOTIFICATIONS_DELETED',
        data: { ids }
      });
    } catch (error) {
      this.logger.error('Failed to delete notifications:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
  }

  async findAll(query: NotificationQuery): Promise<{
    items: Notification[];
    total: number;
  }> {
    try {
      const where = {
        userId: query.userId,
        type: query.type ? { in: query.type } : undefined,
        status: query.status ? { in: query.status } : undefined,
        priority: query.priority ? { in: query.priority } : undefined,
        createdAt: {
          gte: query.from,
          lte: query.to
        }
      };

      const [items, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: query.limit || 50,
          skip: query.offset || 0
        }),
        this.prisma.notification.count({ where })
      ]);

      return { items, total };
    } catch (error) {
      this.logger.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD
      }
    });
  }

  async handleConnection(client: any, userId: string): Promise<void> {
    // Join user's room for personalized notifications
    client.join(userId);
    
    // Send initial unread count
    const unreadCount = await this.getUnreadCount(userId);
    this.server.to(userId).emit('notification', {
      type: 'UNREAD_COUNT',
      data: { count: unreadCount }
    });
  }

  async handleDisconnection(client: any): Promise<void> {
    // Cleanup
  }
} 