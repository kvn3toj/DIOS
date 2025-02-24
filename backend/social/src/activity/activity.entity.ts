import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Profile } from '../profile/profile.entity';

export enum ActivityType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  LIKE = 'LIKE',
  SHARE = 'SHARE',
  FOLLOW = 'FOLLOW',
  ACHIEVEMENT = 'ACHIEVEMENT',
  QUEST_COMPLETION = 'QUEST_COMPLETION',
  REWARD_EARNED = 'REWARD_EARNED',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  CUSTOM = 'CUSTOM'
}

export enum ActivityVisibility {
  PUBLIC = 'PUBLIC',
  CONNECTIONS = 'CONNECTIONS',
  PRIVATE = 'PRIVATE'
}

@ObjectType()
@Entity()
@Index(['profileId', 'createdAt'])
@Index(['type', 'createdAt'])
export class Activity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  profileId: string;

  @Field(() => Profile)
  @ManyToOne(() => Profile, profile => profile.activities)
  profile: Profile;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ActivityType
  })
  type: ActivityType;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ActivityVisibility,
    default: ActivityVisibility.PUBLIC
  })
  visibility: ActivityVisibility;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  targetId: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  targetType: string;

  @Field(() => Number)
  @Column({ default: 0 })
  likesCount: number;

  @Field(() => Number)
  @Column({ default: 0 })
  commentsCount: number;

  @Field(() => Number)
  @Column({ default: 0 })
  sharesCount: number;

  @Field(() => Boolean)
  @Column({ default: false })
  isPinned: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isArchived: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  scheduledAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  expiresAt: Date;
} 