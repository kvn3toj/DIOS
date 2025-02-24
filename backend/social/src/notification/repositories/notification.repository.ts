import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '../notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    const newNotification = this.repository.create(notification);
    return this.repository.save(newNotification);
  }

  async findById(id: string): Promise<Notification> {
    return this.repository.findOne({ where: { id } });
  }

  async findByProfileId(
    profileId: string,
    options: {
      type?: NotificationType;
      status?: NotificationStatus;
      priority?: NotificationPriority;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    const { type, status, priority, limit = 10, offset = 0 } = options;

    const query = this.repository.createQueryBuilder('notification')
      .where('notification.profileId = :profileId', { profileId })
      .orderBy('notification.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    if (status) {
      query.andWhere('notification.status = :status', { status });
    }

    if (priority) {
      query.andWhere('notification.priority = :priority', { priority });
    }

    return query.getMany();
  }

  async findUnreadByProfileId(
    profileId: string,
    options: {
      type?: NotificationType;
      priority?: NotificationPriority;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    return this.findByProfileId({
      ...options,
      profileId,
      status: NotificationStatus.UNREAD,
    });
  }

  async findByType(
    type: NotificationType,
    options: {
      status?: NotificationStatus;
      priority?: NotificationPriority;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    const { status, priority, limit = 10, offset = 0 } = options;

    const query = this.repository.createQueryBuilder('notification')
      .where('notification.type = :type', { type })
      .orderBy('notification.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (status) {
      query.andWhere('notification.status = :status', { status });
    }

    if (priority) {
      query.andWhere('notification.priority = :priority', { priority });
    }

    return query.getMany();
  }

  async update(id: string, notification: Partial<Notification>): Promise<Notification> {
    await this.repository.update(id, notification);
    return this.findById(id);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
  }

  async markAsArchived(id: string): Promise<Notification> {
    return this.update(id, {
      status: NotificationStatus.ARCHIVED,
      archivedAt: new Date(),
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async countUnreadByProfileId(
    profileId: string,
    options: {
      type?: NotificationType;
      priority?: NotificationPriority;
    } = {}
  ): Promise<number> {
    const { type, priority } = options;

    const query = this.repository.createQueryBuilder('notification')
      .where('notification.profileId = :profileId', { profileId })
      .andWhere('notification.status = :status', { status: NotificationStatus.UNREAD });

    if (type) {
      query.andWhere('notification.type = :type', { type });
    }

    if (priority) {
      query.andWhere('notification.priority = :priority', { priority });
    }

    return query.getCount();
  }

  async deleteExpired(): Promise<number> {
    const result = await this.repository.createQueryBuilder()
      .delete()
      .from(Notification)
      .where('expiresAt IS NOT NULL AND expiresAt <= :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  async markAllAsRead(profileId: string, type?: NotificationType): Promise<void> {
    const query = this.repository.createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date(),
      })
      .where('profileId = :profileId', { profileId })
      .andWhere('status = :status', { status: NotificationStatus.UNREAD });

    if (type) {
      query.andWhere('type = :type', { type });
    }

    await query.execute();
  }
} 