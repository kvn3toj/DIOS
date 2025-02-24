import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsEntity } from './entities/analytics.entity';
import { RealTimeAnalyticsService } from './services/real-time-analytics.service';
import { BatchAnalyticsService } from './services/batch-analytics.service';
import { AggregationService } from './services/aggregation.service';
import { DataRetentionService } from './services/data-retention.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalyticsEntity])
  ],
  providers: [
    AnalyticsService,
    AnalyticsResolver,
    RealTimeAnalyticsService,
    BatchAnalyticsService,
    AggregationService,
    DataRetentionService
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService]
})
export class AnalyticsModule {} 