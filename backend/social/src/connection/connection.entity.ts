import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Profile } from '../profile/profile.entity';

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}

@ObjectType()
@Entity()
@Index(['followerId', 'followingId'], { unique: true })
export class Connection {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index()
  followerId: string;

  @Field()
  @Column()
  @Index()
  followingId: string;

  @Field(() => Profile)
  @ManyToOne(() => Profile, profile => profile.following)
  follower: Profile;

  @Field(() => Profile)
  @ManyToOne(() => Profile, profile => profile.followers)
  following: Profile;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING
  })
  status: ConnectionStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isFavorite: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  notificationsEnabled: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  acceptedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  rejectedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  blockedAt: Date;
} 