import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlag } from './entities/feature-flag.entity';

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Post()
  async createFeatureFlag(@Body() createDto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    return this.featureFlagsService.createFeatureFlag(createDto);
  }

  @Get()
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return this.featureFlagsService.getFeatureFlags();
  }

  @Get(':id')
  async getFeatureFlag(@Param('id') id: string): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagsService.getFeatureFlag(id);
    if (!featureFlag) {
      throw new Error('Feature flag not found');
    }
    return featureFlag;
  }

  @Put(':id')
  async updateFeatureFlag(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeatureFlagDto
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.updateFeatureFlag(id, updateDto);
  }

  @Delete(':id')
  async deleteFeatureFlag(@Param('id') id: string): Promise<boolean> {
    return this.featureFlagsService.deleteFeatureFlag(id);
  }

  @Get('evaluate/:key')
  async evaluateFeature(
    @Param('key') key: string,
    @Query() context: Record<string, any>
  ): Promise<{ isEnabled: boolean }> {
    const isEnabled = await this.featureFlagsService.isFeatureEnabled(key, context);
    return { isEnabled };
  }

  @Post(':id/targeting-rules')
  async addTargetingRule(
    @Param('id') id: string,
    @Body() rule: any
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.addTargetingRule(id, rule);
  }

  @Post(':id/experiment-groups')
  async addExperimentGroup(
    @Param('id') id: string,
    @Body() group: any
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.addExperimentGroup(id, group);
  }

  @Put(':id/rollout')
  async updateRolloutPercentage(
    @Param('id') id: string,
    @Body('percentage') percentage: number
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.updateRolloutPercentage(id, percentage);
  }

  @Put(':id/killswitch')
  async toggleKillswitch(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean
  ): Promise<FeatureFlag> {
    return this.featureFlagsService.toggleKillswitch(id, enabled);
  }
} 