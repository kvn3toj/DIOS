import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ActivityType, ActivityVisibility } from '../activity.entity';

@InputType()
export class CreateActivityInput {
  @Field()
  @IsUUID()
  profileId: string;

  @Field(() => ActivityType)
  @IsEnum(ActivityType)
  type: ActivityType;

  @Field(() => ActivityVisibility, { defaultValue: ActivityVisibility.PUBLIC })
  @IsEnum(ActivityVisibility)
  @IsOptional()
  visibility?: ActivityVisibility;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  targetId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  targetType?: string;

  @Field(() => Object, { nullable: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 