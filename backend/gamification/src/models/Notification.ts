import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index
} from 'typeorm';
import { User } from './User';

export enum NotificationType {
  ACHIEVEMENT = 'ACHIEVEMENT',
  QUEST = 'QUEST',
  LEVEL_UP = 'LEVEL_UP',
  REWARD = 'REWARD',
  SYSTEM = 'SYSTEM'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isActionable: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  actionUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  archive(): void {
    this.status = NotificationStatus.ARCHIVED;
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
} 