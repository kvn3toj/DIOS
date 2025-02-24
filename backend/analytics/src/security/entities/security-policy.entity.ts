import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('security_policies')
export class SecurityPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SecurityLevel,
    default: SecurityLevel.MEDIUM
  })
  level: SecurityLevel;

  @Column({ type: 'jsonb' })
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number;
    preventReuse: number;
  };

  @Column({ type: 'jsonb' })
  mfaPolicy: {
    required: boolean;
    allowedMethods: string[];
    gracePeriod: number;
    rememberDevice: boolean;
    rememberPeriod: number;
  };

  @Column({ type: 'jsonb' })
  sessionPolicy: {
    maxConcurrentSessions: number;
    sessionTimeout: number;
    extendOnActivity: boolean;
    requireReauthForSensitive: boolean;
    mobileSessionTimeout: number;
  };

  @Column({ type: 'jsonb' })
  rateLimit: {
    loginAttempts: number;
    loginBlockDuration: number;
    apiRequestsPerMinute: number;
    apiBlockDuration: number;
  };

  @Column({ type: 'jsonb' })
  auditPolicy: {
    logLevel: string;
    retentionPeriod: number;
    sensitiveActions: string[];
    alertThresholds: {
      failedLogins: number;
      suspiciousActivities: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  encryptionSettings: {
    algorithm: string;
    keyRotationPeriod: number;
    minimumKeyLength: number;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', array: true, default: [] })
  appliedTo: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 