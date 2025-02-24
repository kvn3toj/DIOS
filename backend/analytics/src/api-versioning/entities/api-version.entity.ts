import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum VersionStatus {
  CURRENT = 'current',
  DEPRECATED = 'deprecated',
  SUNSET = 'sunset'
}

@Entity('api_versions')
export class ApiVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  version: string;

  @Column()
  path: string;

  @Column({
    type: 'enum',
    enum: VersionStatus,
    default: VersionStatus.CURRENT
  })
  status: VersionStatus;

  @Column({ type: 'jsonb', nullable: true })
  compatibility: {
    minClientVersion: string;
    maxClientVersion: string;
    breakingChanges: {
      description: string;
      affectedEndpoints: string[];
      migrationGuide: string;
    }[];
  };

  @Column({ type: 'jsonb', nullable: true })
  deprecationPolicy: {
    announcementDate: Date;
    deprecationDate: Date;
    sunsetDate: Date;
    migrationPath: string;
  };

  @Column({ type: 'jsonb', default: {} })
  metrics: {
    activeClients: number;
    requestCount: number;
    errorRate: number;
    lastUpdated: Date;
  };

  @Column({ type: 'text', array: true, default: [] })
  supportedFeatures: string[];

  @Column({ type: 'jsonb', nullable: true })
  documentation: {
    changelog: string;
    migrationGuides: string[];
    compatibilityNotes: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 