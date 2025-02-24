import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PerformanceOptimizationService } from './services/performance-optimization.service';
import { PerformanceMiddleware } from './middleware/performance.middleware';
import { PerformanceMetricEntity } from '../metrics/entities/performance-metric.entity';
import { RedisModule } from '../shared/redis/redis.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceMetricEntity]),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    RedisModule,
    MetricsModule,
  ],
  providers: [
    PerformanceOptimizationService,
  ],
  exports: [
    PerformanceOptimizationService,
  ],
})
export class PerformanceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PerformanceMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
} 