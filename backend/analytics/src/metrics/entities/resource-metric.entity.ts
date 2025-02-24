import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

export enum ResourceType {
  DATABASE = 'DATABASE',
  CACHE = 'CACHE',
  QUEUE = 'QUEUE',
  STORAGE = 'STORAGE',
  API = 'API'
}

export enum ResourceMetricType {
  UTILIZATION = 'UTILIZATION',
  AVAILABILITY = 'AVAILABILITY',
  SATURATION = 'SATURATION',
  ERRORS = 'ERRORS',
  LATENCY = 'LATENCY'
}

@ObjectType()
@Entity('resource_metrics')
@Index(['resourceType', 'metricType', 'timestamp'])
@Index(['resourceName', 'timestamp'])
export class ResourceMetricEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: ResourceType })
  resourceType: ResourceType;

  @Field(() => String)
  @Column({ type: 'enum', enum: ResourceMetricType })
  metricType: ResourceMetricType;

  @Field(() => String)
  @Column()
  resourceName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  region?: string;

  @Field(() => Float)
  @Column('float')
  value: number;

  @Field(() => JSON)
  @Column({ type: 'jsonb' })
  metadata: {
    unit: string;
    capacity?: number;
    threshold?: number;
    critical?: number;
    description?: string;
  };

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  status?: {
    health: 'healthy' | 'degraded' | 'critical';
    message?: string;
    lastCheck: Date;
  };

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  alerts?: {
    triggered: boolean;
    level: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
  }[];

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