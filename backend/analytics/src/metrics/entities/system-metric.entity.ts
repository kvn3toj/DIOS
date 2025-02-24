import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

export enum SystemMetricType {
  CPU = 'CPU',
  MEMORY = 'MEMORY',
  DISK = 'DISK',
  NETWORK = 'NETWORK',
  PROCESS = 'PROCESS'
}

@ObjectType()
@Entity('system_metrics')
@Index(['type', 'timestamp'])
@Index(['service', 'timestamp'])
export class SystemMetricEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: SystemMetricType })
  type: SystemMetricType;

  @Field(() => String)
  @Column()
  service: string;

  @Field(() => String)
  @Column()
  instance: string;

  @Field(() => Float)
  @Column('float')
  value: number;

  @Field(() => JSON)
  @Column({ type: 'jsonb' })
  metadata: {
    unit: string;
    min?: number;
    max?: number;
    threshold?: number;
    description?: string;
  };

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  tags?: Record<string, string>;

  @Field(() => Date)
  @Column('timestamp with time zone')
  timestamp: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
} 