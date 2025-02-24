import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class TechnicalMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column('jsonb')
  performance: {
    responseTime: {
      p50: number;
      p95: number;
      p99: number;
    };
  };

  @Column('jsonb')
  availability: {
    uptime: number;
    reliability: number;
  };

  @Column('jsonb')
  resources: {
    cpu: {
      usage: number;
      average: number;
    };
    memory: {
      usage: number;
      average: number;
    };
  };

  @Column('jsonb')
  errors: {
    rate: number;
    distribution: Record<string, number>;
  };

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 