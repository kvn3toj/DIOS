import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureLifecycleController } from './feature-lifecycle.controller';
import { FeatureLifecycleService } from './feature-lifecycle.service';
import { FeatureLifecycle } from './entities/feature-lifecycle.entity';
import { FeatureFlag } from '../feature-flags/entities/feature-flag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureLifecycle, FeatureFlag])
  ],
  controllers: [FeatureLifecycleController],
  providers: [FeatureLifecycleService],
  exports: [FeatureLifecycleService]
})
export class FeatureLifecycleModule {} 