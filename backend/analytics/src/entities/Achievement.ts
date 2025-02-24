import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('integer')
  points: number;

  @Column({
    type: 'enum',
    enum: ['DAILY', 'WEEKLY', 'SPECIAL', 'MILESTONE']
  })
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL' | 'MILESTONE';

  @Column('jsonb')
  criteria: {
    type: string;
    threshold: number;
    conditions: string[];
  };

  @Column('jsonb')
  reward: {
    type: string;
    value: number;
  };

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
} 