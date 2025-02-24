import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class CacheMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  // Redis metrics
  @Column('jsonb')
  redis: {
    hitRate: number;
    missRate: number;
    memoryUsage: number;
    evictionCount: number;
    connectedClients: number;
    commandsProcessed: number;
    keyspaceHits: number;
    keyspaceMisses: number;
    latency: number;
  };

  // Memcached metrics
  @Column('jsonb')
  memcached: {
    hitRate: number;
    missRate: number;
    memoryUsage: number;
    evictionCount: number;
    currentConnections: number;
    totalItems: number;
    getHits: number;
    getMisses: number;
    latency: number;
  };

  // Application cache metrics
  @Column('jsonb')
  application: {
    routeCache: {
      hitRate: number;
      size: number;
      entries: number;
    };
    dataCache: {
      hitRate: number;
      size: number;
      entries: number;
    };
    queryCache: {
      hitRate: number;
      size: number;
      entries: number;
    };
  };

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;
} 