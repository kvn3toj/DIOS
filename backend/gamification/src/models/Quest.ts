import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { QuestProgress } from './QuestProgress';

export enum QuestType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  SPECIAL = 'SPECIAL',
  STORY = 'STORY',
  EVENT = 'EVENT'
}

export enum QuestDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: QuestType,
    default: QuestType.DAILY
  })
  type: QuestType;

  @Column({
    type: 'enum',
    enum: QuestDifficulty,
    default: QuestDifficulty.EASY
  })
  difficulty: QuestDifficulty;

  @Column({ type: 'int', default: 0 })
  experienceReward: number;

  @Column({ type: 'int', default: 0 })
  pointsReward: number;

  @Column({ type: 'jsonb', nullable: true })
  additionalRewards: Record<string, any>;

  @Column({ type: 'jsonb' })
  objectives: {
    type: string;
    target: number;
    description: string;
    order: number;
  }[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  requiredLevel: number;

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: {
    questIds?: string[];
    achievements?: string[];
    level?: number;
    stats?: Record<string, number>;
  };

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'interval', nullable: true })
  timeLimit: string;

  @OneToMany(() => QuestProgress, progress => progress.quest)
  progress: QuestProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  isAvailable(now: Date = new Date()): boolean {
    if (!this.isActive) return false;
    if (this.startDate && this.startDate > now) return false;
    if (this.endDate && this.endDate < now) return false;
    return true;
  }

  getTimeRemaining(now: Date = new Date()): number | null {
    if (!this.endDate) return null;
    return Math.max(0, this.endDate.getTime() - now.getTime());
  }

  getTotalRewardPoints(): number {
    let total = this.pointsReward;
    if (this.additionalRewards?.points) {
      total += this.additionalRewards.points;
    }
    return total;
  }

  checkPrerequisites(user: any): boolean {
    if (!this.prerequisites) return true;

    const {
      questIds = [],
      achievements = [],
      level = 1,
      stats = {}
    } = this.prerequisites;

    // Check level requirement
    if (user.level < level) return false;

    // Additional checks would be implemented here
    // - Quest completion status
    // - Achievement completion
    // - Stats requirements

    return true;
  }
} 