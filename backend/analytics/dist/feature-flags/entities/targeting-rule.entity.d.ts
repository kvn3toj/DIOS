import { FeatureFlag } from './feature-flag.entity';
export type RuleOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
export declare class TargetingRule {
    id: string;
    attribute: string;
    operator: RuleOperator;
    value: any;
    metadata: Record<string, any>;
    featureFlag: FeatureFlag;
    createdAt: Date;
    updatedAt: Date;
}
