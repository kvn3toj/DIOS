import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { FeatureFlag } from '../../feature-flags/entities/feature-flag.entity';

export enum FeatureState {
  DEVELOPMENT = 'development',
  ALPHA = 'alpha',
  BETA = 'beta',
  GA = 'ga',
  DEPRECATED = 'deprecated',
  SUNSET = 'sunset'
}

@Entity('feature_lifecycle')
export class FeatureLifecycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FeatureFlag, { onDelete: 'CASCADE' })
  feature: FeatureFlag;

  @Column({
    type: 'enum',
    enum: FeatureState,
    default: FeatureState.DEVELOPMENT
  })
  state: FeatureState;

  @Column({ type: 'jsonb', nullable: true })
  stateMetadata: {
    enteredAt: Date;
    criteria: string[];
    approvedBy: string;
  };

  @ManyToMany(() => FeatureFlag)
  @JoinTable({
    name: 'feature_dependencies',
    joinColumn: { name: 'dependent_feature_id' },
    inverseJoinColumn: { name: 'dependency_id' }
  })
  dependencies: FeatureFlag[];

  @Column({ type: 'jsonb', nullable: true })
  migrationPlan: {
    steps: {
      description: string;
      completedAt?: Date;
    }[];
    targetDate: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  cleanupStrategy: {
    steps: string[];
    codeReferences: string[];
    dataReferences: string[];
    targetDate: Date;
  };

  @Column({ type: 'jsonb', default: {} })
  usageMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    errorRate: number;
    latency: number;
    lastUpdated: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  versionControl: {
    currentVersion: string;
    minimumSupportedVersion: string;
    breakingChanges: {
      version: string;
      description: string;
      date: Date;
    }[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 