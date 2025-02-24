export declare class CreateFeatureFlagDto {
    key: string;
    name: string;
    description?: string;
    isEnabled?: boolean;
    rolloutPercentage?: number;
    metadata?: Record<string, any>;
    isKillswitchEnabled?: boolean;
}
