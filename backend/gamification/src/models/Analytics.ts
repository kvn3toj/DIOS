import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne
} from 'typeorm';
import { User } from './User';

export enum AnalyticsType {
  USER_ACTION = 'USER_ACTION',
  ACHIEVEMENT = 'ACHIEVEMENT',
  QUEST = 'QUEST',
  REWARD = 'REWARD',
  SYSTEM = 'SYSTEM'
}

export enum AnalyticsCategory {
  ENGAGEMENT = 'ENGAGEMENT',
  PERFORMANCE = 'PERFORMANCE',
  PROGRESSION = 'PROGRESSION',
  MONETIZATION = 'MONETIZATION',
  ERROR = 'ERROR'
}

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'enum',
    enum: AnalyticsType
  })
  type: AnalyticsType;

  @Column({
    type: 'enum',
    enum: AnalyticsCategory
  })
  category: AnalyticsCategory;

  @Column({ length: 100 })
  event: string;

  @Column({ type: 'jsonb' })
  data: {
    value?: number;
    metadata?: Record<string, any>;
    context?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  metrics: {
    duration?: number;
    count?: number;
    value?: number;
    custom?: Record<string, number>;
  };

  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  session: {
    id: string;
    startTime: Date;
    duration?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  addMetric(name: string, value: number): void {
    if (!this.metrics) {
      this.metrics = {};
    }
    if (!this.metrics.custom) {
      this.metrics.custom = {};
    }
    this.metrics.custom[name] = value;
  }

  setDuration(duration: number): void {
    if (!this.metrics) {
      this.metrics = {};
    }
    this.metrics.duration = duration;
  }

  incrementCount(value: number = 1): void {
    if (!this.metrics) {
      this.metrics = {};
    }
    this.metrics.count = (this.metrics.count || 0) + value;
  }

  setValue(value: number): void {
    if (!this.metrics) {
      this.metrics = {};
    }
    this.metrics.value = value;
  }

  addContext(context: Record<string, any>): void {
    if (!this.data) {
      this.data = {};
    }
    this.data.context = { ...this.data.context, ...context };
  }
} 