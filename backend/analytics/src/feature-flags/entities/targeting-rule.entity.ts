import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FeatureFlag } from './feature-flag.entity';

export type RuleOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';

@Entity('targeting_rules')
export class TargetingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  attribute: string;

  @Column({
    type: 'enum',
    enum: ['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan']
  })
  operator: RuleOperator;

  @Column({ type: 'jsonb' })
  value: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => FeatureFlag, featureFlag => featureFlag.targetingRules, { onDelete: 'CASCADE' })
  featureFlag: FeatureFlag;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 