import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseInitService } from './services/database-init.service';
import { DatabaseMonitoringService } from '../monitoring/services/database-monitoring.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseMetric } from '../monitoring/entities/database-metric.entity';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([DatabaseMetric]),
  ],
  providers: [
    DatabaseInitService,
    DatabaseMonitoringService,
  ],
  exports: [
    DatabaseInitService,
    DatabaseMonitoringService,
  ],
})
export class DatabaseModule {} 