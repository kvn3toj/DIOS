import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlagsController } from './feature-flags.controller';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlag } from './entities/feature-flag.entity';
import { TargetingRule } from './entities/targeting-rule.entity';
import { ExperimentGroup } from './entities/experiment-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeatureFlag,
      TargetingRule,
      ExperimentGroup
    ])
  ],
  controllers: [FeatureFlagsController],
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService]
})
export class FeatureFlagsModule {} 