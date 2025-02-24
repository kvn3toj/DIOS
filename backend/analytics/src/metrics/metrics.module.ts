import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsResolver } from './metrics.resolver';
import { SystemMetricEntity } from './entities/system-metric.entity';
import { PerformanceMetricEntity } from './entities/performance-metric.entity';
import { ResourceMetricEntity } from './entities/resource-metric.entity';
import { MetricsCollectorService } from './services/metrics-collector.service';
import { MetricsProcessorService } from './services/metrics-processor.service';
import { AlertingService } from './services/alerting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemMetricEntity,
      PerformanceMetricEntity,
      ResourceMetricEntity
    ])
  ],
  providers: [
    MetricsService,
    MetricsResolver,
    MetricsCollectorService,
    MetricsProcessorService,
    AlertingService
  ],
  controllers: [MetricsController],
  exports: [MetricsService]
})
export class MetricsModule {} 