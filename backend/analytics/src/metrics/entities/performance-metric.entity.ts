import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

export enum PerformanceMetricType {
  RESPONSE_TIME = 'RESPONSE_TIME',
  THROUGHPUT = 'THROUGHPUT',
  ERROR_RATE = 'ERROR_RATE',
  LATENCY = 'LATENCY',
  CONCURRENT_USERS = 'CONCURRENT_USERS',
  RESOURCE_USAGE = 'RESOURCE_USAGE'
}

@ObjectType()
@Entity('performance_metrics')
@Index(['type', 'timestamp'])
@Index(['endpoint', 'timestamp'])
export class PerformanceMetricEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'enum', enum: PerformanceMetricType })
  type: PerformanceMetricType;

  @Field(() => String)
  @Column()
  endpoint: string;

  @Field(() => String)
  @Column()
  method: string;

  @Field(() => Float)
  @Column('float')
  value: number;

  @Field(() => Int, { nullable: true })
  @Column('integer', { nullable: true })
  count?: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  percentile95?: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  percentile99?: number;

  @Field(() => JSON)
  @Column({ type: 'jsonb' })
  metadata: {
    unit: string;
    threshold?: number;
    sla?: number;
    description?: string;
  };

  @Field(() => JSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  breakdown?: {
    database?: number;
    external?: number;
    processing?: number;
    network?: number;
  };

  @Field(() => Date)
  @Column('timestamp with time zone')
  timestamp: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'integer', nullable: true })
  statusCode: number;

  @Column({ type: 'integer', nullable: true })
  requestSize: number;

  @Column({ type: 'integer', nullable: true })
  responseSize: number;

  @Column({ type: 'float', nullable: true })
  duration: number;

  @Column({ type: 'float', nullable: true })
  cpuUsage: number;

  @Column({ type: 'float', nullable: true })
  memoryUsage: number;

  @Column({ type: 'integer', nullable: true })
  concurrentRequests: number;

  @Column({ type: 'boolean', default: false })
  @Index()
  isError: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: Record<string, string>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  environment: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  version: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  region: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  sessionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  requestId: string;
} 