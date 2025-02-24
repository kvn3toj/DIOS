import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from './entities/feature-flag.entity';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { TargetingRule } from './entities/targeting-rule.entity';
import { ExperimentGroup } from './entities/experiment-group.entity';

@Injectable()
export class FeatureFlagsService {
  constructor(
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>,
    @InjectRepository(TargetingRule)
    private targetingRuleRepository: Repository<TargetingRule>,
    @InjectRepository(ExperimentGroup)
    private experimentGroupRepository: Repository<ExperimentGroup>
  ) {}

  async createFeatureFlag(createDto: CreateFeatureFlagDto): Promise<FeatureFlag> {
    const featureFlag = this.featureFlagRepository.create({
      ...createDto,
      isEnabled: false,
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.featureFlagRepository.save(featureFlag);
  }

  async getFeatureFlag(id: string): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagRepository.findOne({
      where: { id },
      relations: ['targetingRules', 'experimentGroups']
    });
    if (!featureFlag) {
      throw new NotFoundException(`Feature flag with ID "${id}" not found`);
    }
    return featureFlag;
  }

  async updateFeatureFlag(id: string, updateDto: UpdateFeatureFlagDto): Promise<FeatureFlag> {
    const featureFlag = await this.getFeatureFlag(id);
    Object.assign(featureFlag, {
      ...updateDto,
      updatedAt: new Date()
    });
    return this.featureFlagRepository.save(featureFlag);
  }

  async isFeatureEnabled(key: string, context: any = {}): Promise<boolean> {
    const featureFlag = await this.featureFlagRepository.findOne({
      where: { key },
      relations: ['targetingRules', 'experimentGroups']
    });

    if (!featureFlag || !featureFlag.isEnabled || featureFlag.isKillswitchEnabled) {
      return false;
    }

    // Check targeting rules
    if (featureFlag.targetingRules?.length > 0) {
      const matchesRules = await this.evaluateTargetingRules(featureFlag.targetingRules, context);
      if (!matchesRules) {
        return false;
      }
    }

    // Check rollout percentage
    if (featureFlag.rolloutPercentage < 100) {
      const userHash = this.generateUserHash(context.userId || '');
      const userPercentile = userHash % 100;
      if (userPercentile >= featureFlag.rolloutPercentage) {
        return false;
      }
    }

    // Check A/B test groups
    if (featureFlag.experimentGroups?.length > 0) {
      return this.evaluateExperimentGroups(featureFlag.experimentGroups, context);
    }

    return true;
  }

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.find({
      relations: ['targetingRules', 'experimentGroups']
    });
  }

  async deleteFeatureFlag(id: string): Promise<boolean> {
    const result = await this.featureFlagRepository.delete(id);
    return result.affected > 0;
  }

  async addTargetingRule(id: string, ruleData: any): Promise<FeatureFlag> {
    const featureFlag = await this.getFeatureFlag(id);
    const rule = this.targetingRuleRepository.create({
      ...ruleData,
      featureFlag
    });
    await this.targetingRuleRepository.save(rule);
    return this.getFeatureFlag(id);
  }

  async addExperimentGroup(id: string, groupData: any): Promise<FeatureFlag> {
    const featureFlag = await this.getFeatureFlag(id);
    const group = this.experimentGroupRepository.create({
      ...groupData,
      featureFlag
    });
    await this.experimentGroupRepository.save(group);
    return this.getFeatureFlag(id);
  }

  async updateRolloutPercentage(id: string, percentage: number): Promise<FeatureFlag> {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
    const featureFlag = await this.getFeatureFlag(id);
    featureFlag.rolloutPercentage = percentage;
    return this.featureFlagRepository.save(featureFlag);
  }

  async toggleKillswitch(id: string, enabled: boolean): Promise<FeatureFlag> {
    const featureFlag = await this.getFeatureFlag(id);
    featureFlag.isKillswitchEnabled = enabled;
    return this.featureFlagRepository.save(featureFlag);
  }

  private async evaluateTargetingRules(rules: TargetingRule[], context: any): Promise<boolean> {
    for (const rule of rules) {
      const matches = await this.evaluateRule(rule, context);
      if (!matches) {
        return false;
      }
    }
    return true;
  }

  private async evaluateRule(rule: TargetingRule, context: any): Promise<boolean> {
    const contextValue = context[rule.attribute];
    
    switch (rule.operator) {
      case 'equals':
        return contextValue === rule.value;
      case 'contains':
        return contextValue?.includes(rule.value);
      case 'startsWith':
        return contextValue?.startsWith(rule.value);
      case 'endsWith':
        return contextValue?.endsWith(rule.value);
      case 'greaterThan':
        return contextValue > rule.value;
      case 'lessThan':
        return contextValue < rule.value;
      default:
        return false;
    }
  }

  private async evaluateExperimentGroups(groups: ExperimentGroup[], context: any): Promise<boolean> {
    const userHash = this.generateUserHash(context.userId || '');
    const groupIndex = userHash % groups.length;
    return groups[groupIndex].isEnabled;
  }

  private generateUserHash(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
} 