import { FeatureFlag } from './feature-flag.entity';
export declare class ExperimentGroup {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    trafficAllocation: number;
    metadata: Record<string, any>;
    variants: Record<string, any>;
    featureFlag: FeatureFlag;
    createdAt: Date;
    updatedAt: Date;
}
