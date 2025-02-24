import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsString, IsOptional, IsObject, IsUUID, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsType, AnalyticsCategory } from '../entities/analytics.entity';

@InputType()
class MetricsInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  value?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  count?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  duration?: number;

  @Field(() => JSON, { nullable: true })
  @IsOptional()
  @IsObject()
  custom?: Record<string, number>;
}

@InputType()
class SessionInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  startTime: Date;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  duration?: number;
}

@InputType()
export class CreateAnalyticsDto {
  @Field(() => String)
  @IsEnum(AnalyticsType)
  type: AnalyticsType;

  @Field(() => String)
  @IsEnum(AnalyticsCategory)
  category: AnalyticsCategory;

  @Field(() => String)
  @IsString()
  event: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  source?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  platform?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  version?: string;

  @Field(() => JSON, { nullable: true })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @Field(() => MetricsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetricsInput)
  metrics?: MetricsInput;

  @Field(() => SessionInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SessionInput)
  session?: SessionInput;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
} 