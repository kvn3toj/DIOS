import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Profile } from '../profile/profile.entity';

export enum NotificationType {
  FOLLOW = 'FOLLOW',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  MENTION = 'MENTION',
  ACHIEVEMENT = 'ACHIEVEMENT',
  QUEST = 'QUEST',
  REWARD = 'REWARD',
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

@ObjectType()
@Entity()
@Index(['profileId', 'createdAt'])
@Index(['type', 'status'])
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  profileId: string;

  @Field(() => Profile)
  @ManyToOne(() => Profile)
  profile: Profile;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority: NotificationPriority;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  message: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  icon: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  action: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  actionUrl: string;

  @Field(() => Boolean)
  @Column({ default: true })
  isActionable: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isDismissible: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isSticky: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  readAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  archivedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  expiresAt: Date;
} 