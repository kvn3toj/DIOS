import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { AchievementProgress } from './AchievementProgress';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  externalId: string;

  @Column({ length: 100 })
  username: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  experience: number;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  stats: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @OneToMany(() => AchievementProgress, progress => progress.user)
  achievements: AchievementProgress[];

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  addExperience(amount: number): void {
    this.experience += amount;
    this.updateLevel();
  }

  addPoints(amount: number): void {
    this.totalPoints += amount;
  }

  private updateLevel(): void {
    // Simple level calculation: each level requires 1000 * level XP
    const newLevel = Math.floor(Math.sqrt(this.experience / 1000)) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
    }
  }

  getExperienceForNextLevel(): number {
    return 1000 * (this.level + 1) * (this.level + 1) - this.experience;
  }

  getLevelProgress(): number {
    const currentLevelExp = 1000 * this.level * this.level;
    const nextLevelExp = 1000 * (this.level + 1) * (this.level + 1);
    const progress = (this.experience - currentLevelExp) / (nextLevelExp - currentLevelExp);
    return Math.min(Math.max(progress * 100, 0), 100);
  }

  updateLastActive(): void {
    this.lastActive = new Date();
  }

  ban(): void {
    this.status = UserStatus.BANNED;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }
} 