import { Repository } from 'typeorm';
import { FeatureFlag } from './entities/feature-flag.entity';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { TargetingRule } from './entities/targeting-rule.entity';
import { ExperimentGroup } from './entities/experiment-group.entity';
export declare class FeatureFlagsService {
    private featureFlagRepository;
    private targetingRuleRepository;
    private experimentGroupRepository;
    constructor(featureFlagRepository: Repository<FeatureFlag>, targetingRuleRepository: Repository<TargetingRule>, experimentGroupRepository: Repository<ExperimentGroup>);
    createFeatureFlag(createDto: CreateFeatureFlagDto): Promise<FeatureFlag>;
    getFeatureFlag(id: string): Promise<FeatureFlag>;
    updateFeatureFlag(id: string, updateDto: UpdateFeatureFlagDto): Promise<FeatureFlag>;
    isFeatureEnabled(key: string, context?: any): Promise<boolean>;
    getFeatureFlags(): Promise<FeatureFlag[]>;
    deleteFeatureFlag(id: string): Promise<boolean>;
    addTargetingRule(id: string, ruleData: any): Promise<FeatureFlag>;
    addExperimentGroup(id: string, groupData: any): Promise<FeatureFlag>;
    updateRolloutPercentage(id: string, percentage: number): Promise<FeatureFlag>;
    toggleKillswitch(id: string, enabled: boolean): Promise<FeatureFlag>;
    private evaluateTargetingRules;
    private evaluateRule;
    private evaluateExperimentGroups;
    private generateUserHash;
}
