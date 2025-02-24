import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CustomLoggerService } from './logger.service';
import { ErrorTrackingService } from './error-tracking.service';
import { ErrorLog } from './entities/error-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorLog]),
    ConfigModule,
    EventEmitterModule.forRoot()
  ],
  providers: [
    CustomLoggerService,
    ErrorTrackingService
  ],
  exports: [
    CustomLoggerService,
    ErrorTrackingService
  ]
})
export class LoggerModule {} 