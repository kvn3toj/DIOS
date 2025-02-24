import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Unique
} from 'typeorm';
import { User } from './User';
import { Achievement } from './Achievement';

export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

@Entity('achievement_progress')
@Unique(['userId', 'achievementId'])
export class AchievementProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  achievementId: string;

  @ManyToOne(() => User, user => user.achievements)
  user: User;

  @ManyToOne(() => Achievement, achievement => achievement.progress)
  achievement: Achievement;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED
  })
  status: ProgressStatus;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @Column({ type: 'jsonb', nullable: true })
  currentValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdated: Date;

  @Column({ default: false })
  rewardsCollected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  updateProgress(value: number): void {
    this.progress = Math.min(Math.max(value, 0), 100);
    this.lastUpdated = new Date();
    
    if (this.progress === 0) {
      this.status = ProgressStatus.NOT_STARTED;
    } else if (this.progress < 100) {
      this.status = ProgressStatus.IN_PROGRESS;
    } else {
      this.status = ProgressStatus.COMPLETED;
      this.completedAt = new Date();
    }
  }

  markAsCompleted(): void {
    this.status = ProgressStatus.COMPLETED;
    this.progress = 100;
    this.completedAt = new Date();
    this.lastUpdated = new Date();
  }

  markAsFailed(): void {
    this.status = ProgressStatus.FAILED;
    this.lastUpdated = new Date();
  }

  collectRewards(): void {
    if (this.status === ProgressStatus.COMPLETED && !this.rewardsCollected) {
      this.rewardsCollected = true;
      this.lastUpdated = new Date();
    }
  }

  reset(): void {
    this.status = ProgressStatus.NOT_STARTED;
    this.progress = 0;
    this.completedAt = null;
    this.rewardsCollected = false;
    this.lastUpdated = new Date();
  }
} 