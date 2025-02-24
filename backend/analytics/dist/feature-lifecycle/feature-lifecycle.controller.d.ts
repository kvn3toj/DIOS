import { FeatureLifecycleService } from './feature-lifecycle.service';
import { FeatureLifecycle, FeatureState } from './entities/feature-lifecycle.entity';
declare class UpdateStateDto {
    state: FeatureState;
    approver: string;
}
declare class UpdateMigrationPlanDto {
    steps: string[];
    targetDate: Date;
}
declare class UpdateCleanupStrategyDto {
    steps: string[];
    codeReferences: string[];
    dataReferences: string[];
    targetDate: Date;
}
declare class UpdateVersionControlDto {
    currentVersion: string;
    minimumSupportedVersion: string;
    breakingChanges: Array<{
        version: string;
        description: string;
        date: Date;
    }>;
}
export declare class FeatureLifecycleController {
    private readonly lifecycleService;
    constructor(lifecycleService: FeatureLifecycleService);
    createLifecycle(featureId: string): Promise<FeatureLifecycle>;
    updateState(id: string, updateStateDto: UpdateStateDto): Promise<FeatureLifecycle>;
    addDependency(id: string, dependencyId: string): Promise<FeatureLifecycle>;
    updateMigrationPlan(id: string, updateMigrationPlanDto: UpdateMigrationPlanDto): Promise<FeatureLifecycle>;
    updateCleanupStrategy(id: string, updateCleanupStrategyDto: UpdateCleanupStrategyDto): Promise<FeatureLifecycle>;
    updateVersionControl(id: string, updateVersionControlDto: UpdateVersionControlDto): Promise<FeatureLifecycle>;
    getLifecycle(id: string): Promise<FeatureLifecycle>;
    getLifecycleByFeature(featureId: string): Promise<FeatureLifecycle>;
}
export {};
