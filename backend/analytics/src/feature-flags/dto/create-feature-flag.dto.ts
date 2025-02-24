import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeatureFlagDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  rolloutPercentage?: number;

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  metadata?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isKillswitchEnabled?: boolean;
} 