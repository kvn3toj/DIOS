import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Connection } from '../connection/connection.entity';
import { Activity } from '../activity/activity.entity';

@ObjectType()
@Entity()
export class Profile {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  displayName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  interests: string[];

  @Field(() => [Connection], { nullable: true })
  @OneToMany(() => Connection, connection => connection.profile)
  connections: Connection[];

  @Field(() => [Activity], { nullable: true })
  @OneToMany(() => Activity, activity => activity.profile)
  activities: Activity[];

  @Field()
  @Column({ default: 0 })
  connectionCount: number;

  @Field()
  @Column({ default: 0 })
  activityCount: number;

  @Field()
  @Column({ default: false })
  isVerified: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastSeenAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  badges: string[];
} 