import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyticsModule } from './analytics/analytics.module';
import { MetricsModule } from './metrics/metrics.module';
import { ReportingModule } from './reporting/reporting.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { LoggerModule } from './logger/logger.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SecurityModule } from './security/security.module';
import { PrismaService } from './prisma/prisma.service';
import { ContentService } from './services/content.service';
import { ContentController } from './controllers/content.controller';
import { SocialService } from './services/social.service';
import { SocialController } from './controllers/social.controller';
import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controllers/metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env']
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production'
      }),
      inject: [ConfigService]
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
      playground: true
    }),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'analytics_queue',
            queueOptions: {
              durable: true
            }
          }
        }),
        inject: [ConfigService]
      }
    ]),
    AnalyticsModule,
    MetricsModule,
    ReportingModule,
    DashboardModule,
    HealthModule,
    LoggerModule,
    EventEmitterModule.forRoot(),
    SecurityModule,
  ],
  controllers: [
    ContentController,
    SocialController,
    SearchController,
    NotificationController,
    MetricsController
  ],
  providers: [
    PrismaService,
    ContentService,
    SocialService,
    SearchService,
    NotificationService,
    MetricsService
  ],
})
export class AppModule {} 