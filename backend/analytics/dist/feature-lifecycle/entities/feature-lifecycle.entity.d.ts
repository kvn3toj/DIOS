import { FeatureFlag } from '../../feature-flags/entities/feature-flag.entity';
export declare enum FeatureState {
    DEVELOPMENT = "development",
    ALPHA = "alpha",
    BETA = "beta",
    GA = "ga",
    DEPRECATED = "deprecated",
    SUNSET = "sunset"
}
export declare class FeatureLifecycle {
    id: string;
    feature: FeatureFlag;
    state: FeatureState;
    stateMetadata: {
        enteredAt: Date;
        criteria: string[];
        approvedBy: string;
    };
    dependencies: FeatureFlag[];
    migrationPlan: {
        steps: {
            description: string;
            completedAt?: Date;
        }[];
        targetDate: Date;
    };
    cleanupStrategy: {
        steps: string[];
        codeReferences: string[];
        dataReferences: string[];
        targetDate: Date;
    };
    usageMetrics: {
        dailyActiveUsers: number;
        weeklyActiveUsers: number;
        monthlyActiveUsers: number;
        errorRate: number;
        latency: number;
        lastUpdated: Date;
    };
    versionControl: {
        currentVersion: string;
        minimumSupportedVersion: string;
        breakingChanges: {
            version: string;
            description: string;
            date: Date;
        }[];
    };
    createdAt: Date;
    updatedAt: Date;
}
