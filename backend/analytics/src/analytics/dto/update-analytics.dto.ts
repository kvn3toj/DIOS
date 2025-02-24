import { IsString, IsEnum, IsUUID, IsObject, IsOptional, IsDateString } from 'class-validator';
import { AnalyticsType, AnalyticsCategory } from '../entities/analytics.entity';

export class UpdateAnalyticsDto {
  @IsEnum(AnalyticsType)
  @IsOptional()
  type?: AnalyticsType;

  @IsEnum(AnalyticsCategory)
  @IsOptional()
  category?: AnalyticsCategory;

  @IsString()
  @IsOptional()
  event?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  platform?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metrics?: {
    value?: number;
    count?: number;
    duration?: number;
    custom?: Record<string, any>;
  };

  @IsObject()
  @IsOptional()
  session?: {
    id: string;
    startTime: Date;
    duration: number;
  };

  @IsDateString()
  @IsOptional()
  timestamp?: string;
} 