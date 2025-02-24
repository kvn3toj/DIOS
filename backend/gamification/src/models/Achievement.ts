import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index
} from 'typeorm';
import { User } from './User';
import { AchievementProgress } from './AchievementProgress';

export enum AchievementType {
  MILESTONE = 'MILESTONE',
  COLLECTION = 'COLLECTION',
  SKILL = 'SKILL',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'SPECIAL'
}

export enum AchievementRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
    default: AchievementType.MILESTONE
  })
  type: AchievementType;

  @Column({
    type: 'enum',
    enum: AchievementRarity,
    default: AchievementRarity.COMMON
  })
  rarity: AchievementRarity;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'jsonb', nullable: true })
  criteria: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  rewards: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSecret: boolean;

  @Column({ type: 'int', default: 1 })
  requiredLevel: number;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date;

  @OneToMany(() => AchievementProgress, progress => progress.achievement)
  progress: AchievementProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isAvailable(): boolean {
    if (!this.availableUntil) return true;
    return this.availableUntil > new Date();
  }

  get progressPercentage(): number {
    if (!this.criteria || !this.progress) return 0;
    // Implementation depends on criteria type
    return 0;
  }
} 