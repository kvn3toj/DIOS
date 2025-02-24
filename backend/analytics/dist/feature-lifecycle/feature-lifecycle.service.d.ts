import { Repository } from 'typeorm';
import { FeatureLifecycle, FeatureState } from './entities/feature-lifecycle.entity';
import { FeatureFlag } from '../feature-flags/entities/feature-flag.entity';
export declare class FeatureLifecycleService {
    private lifecycleRepository;
    private featureFlagRepository;
    constructor(lifecycleRepository: Repository<FeatureLifecycle>, featureFlagRepository: Repository<FeatureFlag>);
    createLifecycle(featureId: string): Promise<FeatureLifecycle>;
    updateState(id: string, newState: FeatureState, approver: string): Promise<FeatureLifecycle>;
    addDependency(id: string, dependencyId: string): Promise<FeatureLifecycle>;
    updateMigrationPlan(id: string, steps: string[], targetDate: Date): Promise<FeatureLifecycle>;
    updateCleanupStrategy(id: string, steps: string[], codeRefs: string[], dataRefs: string[], targetDate: Date): Promise<FeatureLifecycle>;
    updateUsageMetrics(id: string, metrics: Partial<FeatureLifecycle['usageMetrics']>): Promise<FeatureLifecycle>;
    updateVersionControl(id: string, currentVersion: string, minVersion: string, breakingChanges: Array<{
        version: string;
        description: string;
        date: Date;
    }>): Promise<FeatureLifecycle>;
    private isValidStateTransition;
    private validateDependenciesForGA;
    private hasCircularDependency;
    private getStateEntryCriteria;
}
