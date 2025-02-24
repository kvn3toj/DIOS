import { NotificationService, CreateNotificationDto, UpdateNotificationDto, NotificationQuery } from '../services/notification.service';
import { Notification } from '@prisma/client';
export declare class NotificationController {
    private readonly notificationService;
    private readonly logger;
    constructor(notificationService: NotificationService);
    create(dto: CreateNotificationDto): Promise<{
        success: boolean;
        data: Notification;
    }>;
    update(id: string, dto: UpdateNotificationDto): Promise<{
        success: boolean;
        data: Notification;
    }>;
    markAsRead(userId: string, ids: string[]): Promise<{
        success: boolean;
    }>;
    delete(userId: string, ids: string[]): Promise<{
        success: boolean;
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: Notification | null;
    }>;
    findAll(query: NotificationQuery): Promise<{
        success: boolean;
        data: {
            items: Notification[];
            total: number;
        };
    }>;
    getUnreadCount(userId: string): Promise<{
        success: boolean;
        data: {
            count: number;
        };
    }>;
}
