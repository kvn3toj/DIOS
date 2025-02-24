import { TargetingRule } from './targeting-rule.entity';
import { ExperimentGroup } from './experiment-group.entity';
export declare class FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    isEnabled: boolean;
    rolloutPercentage: number;
    metadata: Record<string, any>;
    targetingRules: TargetingRule[];
    experimentGroups: ExperimentGroup[];
    isKillswitchEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
