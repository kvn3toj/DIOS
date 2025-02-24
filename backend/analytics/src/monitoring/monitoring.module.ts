import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './services/monitoring.service';
import { PerformanceTrackingService } from './services/performance-tracking.service';
import { ErrorTrackingService } from './error-tracking.service';
import { ResourceMonitoringService } from './services/resource-monitoring.service';
import { NetworkMonitoringService } from './services/network-monitoring.service';
import { DatabaseMonitoringService } from './services/database-monitoring.service';
import { CacheMonitoringService } from './services/cache-monitoring.service';
import { ResourceMetric } from './entities/resource-metric.entity';
import { ErrorLog } from './entities/error-log.entity';
import { NetworkMetric } from './entities/network-metric.entity';
import { DatabaseMetric } from './entities/database-metric.entity';
import { CacheMetric } from './entities/cache-metric.entity';
import { TechnicalMetric } from './entities/technical-metric.entity';
import { BusinessMetric } from './entities/business-metric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ErrorLog,
      ResourceMetric,
      NetworkMetric,
      DatabaseMetric,
      CacheMetric,
      TechnicalMetric,
      BusinessMetric
    ]),
    ConfigModule,
    EventEmitterModule.forRoot()
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    PerformanceTrackingService,
    ErrorTrackingService,
    ResourceMonitoringService,
    NetworkMonitoringService,
    DatabaseMonitoringService,
    CacheMonitoringService
  ],
  exports: [
    MonitoringService,
    PerformanceTrackingService,
    ErrorTrackingService,
    ResourceMonitoringService,
    NetworkMonitoringService,
    DatabaseMonitoringService,
    CacheMonitoringService
  ]
})
export class MonitoringModule {}