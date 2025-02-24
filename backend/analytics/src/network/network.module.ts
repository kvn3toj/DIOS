import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NetworkConfigService } from './services/network-config.service';
import { NetworkMonitoringService } from '../monitoring/services/network-monitoring.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkMetric } from '../monitoring/entities/network-metric.entity';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([NetworkMetric]),
  ],
  providers: [
    NetworkConfigService,
    NetworkMonitoringService,
  ],
  exports: [
    NetworkConfigService,
    NetworkMonitoringService,
  ],
})
export class NetworkModule {} 