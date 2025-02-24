import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FeatureFlag } from './feature-flag.entity';

@Entity('experiment_groups')
export class ExperimentGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'float', default: 0 })
  trafficAllocation: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  variants: Record<string, any>;

  @ManyToOne(() => FeatureFlag, featureFlag => featureFlag.experimentGroups, { onDelete: 'CASCADE' })
  featureFlag: FeatureFlag;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 