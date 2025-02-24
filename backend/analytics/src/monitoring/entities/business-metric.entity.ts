import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class BusinessMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column('jsonb')
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    retention: {
      d1: number;
      d7: number;
      d30: number;
    };
  };

  @Column('jsonb')
  monetization: {
    revenue: {
      daily: number;
      arpu: number;
      ltv: number;
    };
  };

  @Column('jsonb')
  conversion: {
    rate: number;
    value: number;
  };

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 