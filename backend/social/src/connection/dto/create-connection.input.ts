import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateConnectionInput {
  @Field()
  @IsUUID()
  followerId: string;

  @Field()
  @IsUUID()
  followingId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
} 