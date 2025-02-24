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
import { Quest } from './Quest';

export enum QuestProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

@Entity('quest_progress')
@Unique(['userId', 'questId'])
export class QuestProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  questId: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Quest, quest => quest.progress)
  quest: Quest;

  @Column({
    type: 'enum',
    enum: QuestProgressStatus,
    default: QuestProgressStatus.NOT_STARTED
  })
  status: QuestProgressStatus;

  @Column({ type: 'jsonb', default: [] })
  objectiveProgress: {
    objectiveIndex: number;
    currentValue: number;
    completed: boolean;
    completedAt?: Date;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  rewardsCollected: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  start(): void {
    if (this.status === QuestProgressStatus.NOT_STARTED) {
      this.status = QuestProgressStatus.IN_PROGRESS;
      this.startedAt = new Date();
      
      // Initialize objective progress if not already done
      if (!this.objectiveProgress?.length) {
        this.objectiveProgress = this.quest.objectives.map((_, index) => ({
          objectiveIndex: index,
          currentValue: 0,
          completed: false
        }));
      }
    }
  }

  updateObjectiveProgress(objectiveIndex: number, value: number): void {
    if (!this.objectiveProgress) return;

    const objective = this.quest.objectives[objectiveIndex];
    const progress = this.objectiveProgress[objectiveIndex];

    if (objective && progress) {
      progress.currentValue = Math.min(value, objective.target);
      progress.completed = progress.currentValue >= objective.target;
      if (progress.completed && !progress.completedAt) {
        progress.completedAt = new Date();
      }

      // Check if all objectives are completed
      const allCompleted = this.objectiveProgress.every(p => p.completed);
      if (allCompleted && this.status !== QuestProgressStatus.COMPLETED) {
        this.complete();
      }
    }
  }

  complete(): void {
    this.status = QuestProgressStatus.COMPLETED;
    this.completedAt = new Date();
  }

  fail(): void {
    this.status = QuestProgressStatus.FAILED;
  }

  expire(): void {
    if (this.status !== QuestProgressStatus.COMPLETED) {
      this.status = QuestProgressStatus.EXPIRED;
    }
  }

  collectRewards(): void {
    if (this.status === QuestProgressStatus.COMPLETED && !this.rewardsCollected) {
      this.rewardsCollected = true;
    }
  }

  reset(): void {
    this.status = QuestProgressStatus.NOT_STARTED;
    this.objectiveProgress = [];
    this.startedAt = null;
    this.completedAt = null;
    this.rewardsCollected = false;
  }

  getProgress(): number {
    if (!this.objectiveProgress?.length) return 0;

    const totalProgress = this.objectiveProgress.reduce((sum, progress) => {
      const objective = this.quest.objectives[progress.objectiveIndex];
      if (!objective) return sum;
      return sum + (progress.currentValue / objective.target);
    }, 0);

    return (totalProgress / this.objectiveProgress.length) * 100;
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }
} 