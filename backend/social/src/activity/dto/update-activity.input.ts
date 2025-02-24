import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ActivityVisibility } from '../activity.entity';

@InputType()
export class UpdateActivityInput {
  @Field(() => ActivityVisibility, { nullable: true })
  @IsEnum(ActivityVisibility)
  @IsOptional()
  visibility?: ActivityVisibility;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => Object, { nullable: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 