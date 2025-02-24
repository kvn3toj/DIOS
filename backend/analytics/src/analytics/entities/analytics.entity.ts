import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { AnalyticsType } from '../enums/analytics-type.enum';
import { AnalyticsCategory } from '../enums/analytics-category.enum';

@ObjectType()
@Entity('analytics')
@Index(['type', 'category'])
@Index(['timestamp'])
@Index(['userId'])
export class AnalyticsEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: AnalyticsType })
  type!: AnalyticsType;

  @Field(() => String)
  @Column({ type: 'enum', enum: AnalyticsCategory })
  category!: AnalyticsCategory;

  @Field(() => String)
  @Column()
  event!: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sessionId?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  deviceId?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  source?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  platform?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  version?: string;

  @Field(() => Date)
  @CreateDateColumn()
  timestamp!: Date;

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  context?: {
    url?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
  };

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  customData?: Record<string, any>;

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metrics?: {
    value?: number;
    count?: number;
    duration?: number;
    custom?: Record<string, number>;
  };

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  session?: {
    id: string;
    startTime: Date;
    duration?: number;
  };

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;
} 