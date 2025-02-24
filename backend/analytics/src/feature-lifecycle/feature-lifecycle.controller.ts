import { Controller, Post, Put, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { FeatureLifecycleService } from './feature-lifecycle.service';
import { FeatureLifecycle, FeatureState } from './entities/feature-lifecycle.entity';

class UpdateStateDto {
  state: FeatureState;
  approver: string;
}

class UpdateMigrationPlanDto {
  steps: string[];
  targetDate: Date;
}

class UpdateCleanupStrategyDto {
  steps: string[];
  codeReferences: string[];
  dataReferences: string[];
  targetDate: Date;
}

class UpdateVersionControlDto {
  currentVersion: string;
  minimumSupportedVersion: string;
  breakingChanges: Array<{
    version: string;
    description: string;
    date: Date;
  }>;
}

@Controller('feature-lifecycle')
export class FeatureLifecycleController {
  constructor(private readonly lifecycleService: FeatureLifecycleService) {}

  @Post(':featureId')
  async createLifecycle(
    @Param('featureId') featureId: string
  ): Promise<FeatureLifecycle> {
    return this.lifecycleService.createLifecycle(featureId);
  }

  @Put(':id/state')
  async updateState(
    @Param('id') id: string,
    @Body(ValidationPipe) updateStateDto: UpdateStateDto
  ): Promise<FeatureLifecycle> {
    return this.lifecycleService.updateState(
      id,
      updateStateDto.state,
      updateStateDto.approver
    );
  }

  @Post(':id/dependencies/:dependencyId')
  async addDependency(
    @Param('id') id: string,
    @Param('dependencyId') dependencyId: string
  ): Promise<FeatureLifecycle> {
    return this.lifecycleService.addDependency(id, dependencyId);
  }

  @Put(':id/migration-plan')
  async updateMigrationPlan(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMigrationPlanDto: UpdateMigrationPlanDto
  ): Promise<FeatureLifecycle> {
    return this.lifecycleService.updateMigrationPlan(
      id,
      updateMigrationPlanDto.steps,
      updateMigrationPlanDto.targetDate
    );
  }

  @Put(':id/cleanup-strategy')
  async updateCleanupStrategy(
    @Param('id') id: string,
    @Body(ValidationPipe) updateCleanupStrategyDto: UpdateCleanupStrategyDto
  ): Promise<FeatureLifecycle> {
    return this.lifecycleService.updateCleanupStrategy(
      id,
      updateCleanupStrategyDto.steps,
      updateCleanupStrategyDto.codeReferences,
      updateCleanupStrategyDto.dataReferences,
      updateCleanupStrategyDto.targetDate
    );
  }

  @Put(':id/version-control')
  async updateVersionControl(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVersionControlDto: UpdateVersionControlDto
  ): Promise<FeatureLifecycle> {
    return this.lifecycleService.updateVersionControl(
      id,
      updateVersionControlDto.currentVersion,
      updateVersionControlDto.minimumSupportedVersion,
      updateVersionControlDto.breakingChanges
    );
  }

  @Get(':id')
  async getLifecycle(@Param('id') id: string): Promise<FeatureLifecycle> {
    return this.lifecycleService.getLifecycle(id);
  }

  @Get('feature/:featureId')
  async getLifecycleByFeature(@Param('featureId') featureId: string): Promise<FeatureLifecycle> {
    return this.lifecycleService.getLifecycleByFeature(featureId);
  }
} 