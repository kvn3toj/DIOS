import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class ErrorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  @Column()
  name: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  stack?: string;

  @Column()
  @Index()
  context: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  })
  @Index()
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({
    type: 'enum',
    enum: ['new', 'investigating', 'resolved', 'ignored'],
    default: 'new'
  })
  @Index()
  status: 'new' | 'investigating' | 'resolved' | 'ignored';

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ nullable: true })
  resolvedAt?: Date;

  @Column({ nullable: true })
  resolvedBy?: string;

  @Column('text', { nullable: true })
  resolution?: string;
} 