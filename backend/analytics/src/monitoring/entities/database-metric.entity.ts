import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class DatabaseMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  // Connection metrics
  @Column('integer')
  activeConnections: number;

  @Column('integer')
  idleConnections: number;

  @Column('integer')
  maxConnections: number;

  @Column('float')
  connectionUtilization: number;

  @Column('integer')
  waitingQueries: number;

  // Performance metrics
  @Column('float')
  avgQueryTime: number;

  @Column('integer')
  slowQueries: number;

  @Column('integer')
  deadlocks: number;

  @Column('integer')
  rollbacks: number;

  @Column('jsonb')
  transactions: {
    active: number;
    committed: number;
    rolledBack: number;
  };

  // Cache metrics
  @Column('float')
  cacheHitRatio: number;

  @Column('float')
  indexHitRatio: number;

  @Column('float')
  bufferCacheHitRatio: number;

  @Column('float')
  sharedBufferUsage: number;

  // Table metrics
  @Column('jsonb')
  tableStats: {
    totalRows: number;
    totalSize: number;
    indexSize: number;
    scanTypes: {
      seqScans: number;
      indexScans: number;
    };
  };

  @Column('jsonb')
  vacuumStats: {
    lastAutoVacuum: Date;
    autoVacuumCount: number;
  };

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 