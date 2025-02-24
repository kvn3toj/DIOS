import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '@prisma/client';
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
export declare class NotificationService {
    private readonly prisma;
    private readonly eventEmitter;
    private server;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    create(dto: CreateNotificationDto): Promise<Notification>;
    update(id: string, dto: UpdateNotificationDto): Promise<Notification>;
    markAsRead(userId: string, ids: string[]): Promise<void>;
    delete(userId: string, ids: string[]): Promise<void>;
    findById(id: string): Promise<Notification | null>;
    findAll(query: NotificationQuery): Promise<{
        items: Notification[];
        total: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    handleConnection(client: any, userId: string): Promise<void>;
    handleDisconnection(client: any): Promise<void>;
}
