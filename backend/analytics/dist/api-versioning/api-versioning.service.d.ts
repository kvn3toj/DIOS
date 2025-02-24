import { Repository } from 'typeorm';
import { ApiVersion } from './entities/api-version.entity';
export declare class ApiVersioningService {
    private apiVersionRepository;
    constructor(apiVersionRepository: Repository<ApiVersion>);
    createVersion(version: string, path: string, supportedFeatures: string[], compatibility: ApiVersion['compatibility']): Promise<ApiVersion>;
    deprecateVersion(version: string, deprecationPolicy: ApiVersion['deprecationPolicy']): Promise<ApiVersion>;
    sunsetVersion(version: string): Promise<ApiVersion>;
    updateMetrics(version: string, metrics: Partial<ApiVersion['metrics']>): Promise<ApiVersion>;
    addBreakingChange(version: string, change: {
        description: string;
        affectedEndpoints: string[];
        migrationGuide: string;
    }): Promise<ApiVersion>;
    updateDocumentation(version: string, documentation: Partial<ApiVersion['documentation']>): Promise<ApiVersion>;
    getActiveVersions(): Promise<ApiVersion[]>;
    validateClientVersion(clientVersion: string): Promise<{
        compatible: boolean;
        recommendedVersion?: string;
        migrationGuide?: string;
    }>;
}
