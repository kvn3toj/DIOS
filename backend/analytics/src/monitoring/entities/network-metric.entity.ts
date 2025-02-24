import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class NetworkMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  // Network I/O
  @Column('bigint')
  bytesIn: number;

  @Column('bigint')
  bytesOut: number;

  @Column('integer')
  packetsIn: number;

  @Column('integer')
  packetsOut: number;

  @Column('integer')
  errors: number;

  @Column('integer')
  dropped: number;

  // Latency metrics
  @Column('float')
  avgLatency: number;

  @Column('float')
  maxLatency: number;

  @Column('float')
  minLatency: number;

  @Column('float')
  jitter: number;

  // Connectivity metrics
  @Column('float')
  packetLoss: number;

  @Column('varchar')
  connectionStatus: string;

  @Column('integer')
  activeConnections: number;

  @Column('integer')
  connectionErrors: number;

  // Throughput metrics
  @Column('float')
  utilization: number;

  @Column('float')
  saturation: number;

  @Column('jsonb')
  bandwidth: {
    incoming: number;
    outgoing: number;
  };

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 