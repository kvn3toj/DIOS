import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class MonitoringMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column('jsonb')
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };

  @Column('jsonb')
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };

  @Column('jsonb')
  process: {
    uptime: number;
    pid: number;
    memory: {
      heapTotal: number;
      heapUsed: number;
      rss: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
  };

  @Column('jsonb')
  system: {
    platform: string;
    arch: string;
    version: string;
    uptime: number;
    hostname: string;
    networkInterfaces: any;
  };

  @Column({ type: 'enum', enum: ['healthy', 'warning', 'critical'], default: 'healthy' })
  status: 'healthy' | 'warning' | 'critical';

  @Column('jsonb', { nullable: true })
  alerts?: Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;

  @Column({ type: 'enum', enum: ['metric', 'alert'], default: 'metric' })
  type: 'metric' | 'alert';
} 