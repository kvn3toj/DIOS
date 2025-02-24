import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import configuration from './config/configuration';
import { ProfileModule } from './profile/profile.module';
import { ConnectionModule } from './connection/connection.module';
import { ActivityModule } from './activity/activity.module';
import { NotificationModule } from './notification/notification.module';
import { EventBusModule } from './eventbus/eventbus.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env']
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        subscribers: ['dist/subscribers/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),

    // GraphQL Federation
    GraphQLFederationModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('graphql'),
      }),
      inject: [ConfigService],
    }),

    // Event Bus
    ClientsModule.registerAsync([
      {
        name: 'EVENT_BUS',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            url: `redis://${configService.get('redis.host')}:${configService.get('redis.port')}`,
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Logging
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        ],
      }),
      inject: [ConfigService],
    }),

    // Core Modules
    CqrsModule,
    ScheduleModule.forRoot(),
    PrometheusModule.register(),
    HealthModule,
    LoggerModule,
    MetricsModule,

    // Feature Modules
    ProfileModule,
    ConnectionModule,
    ActivityModule,
    NotificationModule,
    EventBusModule,
  ],
})
export class AppModule {} 