import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class ResourceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  @Column('float')
  cpuUsage: number;

  @Column('bigint')
  memoryUsed: number;

  @Column('bigint')
  memoryTotal: number;

  @Column('float')
  memoryPercentage: number;

  @Column('bigint')
  diskUsed: number;

  @Column('bigint')
  diskTotal: number;

  @Column('float')
  diskPercentage: number;

  @Column('bigint')
  networkBytesIn: number;

  @Column('bigint')
  networkBytesOut: number;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 