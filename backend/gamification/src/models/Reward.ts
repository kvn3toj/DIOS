import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne } from 'typeorm';
import { User } from './User';

export enum RewardType {
  POINTS = 'POINTS',
  EXPERIENCE = 'EXPERIENCE',
  BADGE = 'BADGE',
  ITEM = 'ITEM',
  CURRENCY = 'CURRENCY',
  POWER_UP = 'POWER_UP',
  COSMETIC = 'COSMETIC',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export enum RewardStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED'
}

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RewardType
  })
  type: RewardType;

  @Column({ type: 'jsonb' })
  value: {
    amount?: number;
    itemId?: string;
    metadata?: Record<string, any>;
  };

  @Column({
    type: 'enum',
    enum: RewardStatus,
    default: RewardStatus.AVAILABLE
  })
  status: RewardStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  source: {
    type: 'ACHIEVEMENT' | 'QUEST' | 'LEVEL_UP' | 'SYSTEM';
    id: string;
    metadata?: Record<string, any>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  claim(): void {
    if (this.status === RewardStatus.AVAILABLE) {
      this.status = RewardStatus.CLAIMED;
      this.claimedAt = new Date();
    }
  }

  isExpired(now: Date = new Date()): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < now;
  }

  updateStatus(now: Date = new Date()): void {
    if (this.status === RewardStatus.AVAILABLE && this.isExpired(now)) {
      this.status = RewardStatus.EXPIRED;
    }
  }
} 