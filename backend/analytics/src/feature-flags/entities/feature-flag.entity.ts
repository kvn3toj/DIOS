import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TargetingRule } from './targeting-rule.entity';
import { ExperimentGroup } from './experiment-group.entity';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  rolloutPercentage: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => TargetingRule, rule => rule.featureFlag, { cascade: true })
  targetingRules: TargetingRule[];

  @OneToMany(() => ExperimentGroup, group => group.featureFlag, { cascade: true })
  experimentGroups: ExperimentGroup[];

  @Column({ default: false })
  isKillswitchEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 