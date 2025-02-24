import { FeatureFlagsService } from './feature-flags.service';
import { CreateFeatureFlagDto } from './dto/create-feature-flag.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
import { FeatureFlag } from './entities/feature-flag.entity';
export declare class FeatureFlagsController {
    private readonly featureFlagsService;
    constructor(featureFlagsService: FeatureFlagsService);
    createFeatureFlag(createDto: CreateFeatureFlagDto): Promise<FeatureFlag>;
    getFeatureFlags(): Promise<FeatureFlag[]>;
    getFeatureFlag(id: string): Promise<FeatureFlag>;
    updateFeatureFlag(id: string, updateDto: UpdateFeatureFlagDto): Promise<FeatureFlag>;
    deleteFeatureFlag(id: string): Promise<boolean>;
    evaluateFeature(key: string, context: Record<string, any>): Promise<{
        isEnabled: boolean;
    }>;
    addTargetingRule(id: string, rule: any): Promise<FeatureFlag>;
    addExperimentGroup(id: string, group: any): Promise<FeatureFlag>;
    updateRolloutPercentage(id: string, percentage: number): Promise<FeatureFlag>;
    toggleKillswitch(id: string, enabled: boolean): Promise<FeatureFlag>;
}
