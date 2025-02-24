import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('quests')
export class Quest {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ['DAILY', 'WEEKLY', 'SPECIAL', 'CHAIN']
  })
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL' | 'CHAIN';

  @Column('jsonb')
  requirements: {
    achievements: string[];
    level: number;
    items: string[];
  };

  @Column('jsonb')
  reward: {
    type: string;
    value: number;
  };

  @Column('timestamp')
  deadline: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
} 