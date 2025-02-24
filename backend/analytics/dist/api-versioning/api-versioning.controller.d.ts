import { ApiVersioningService } from './api-versioning.service';
import { ApiVersion } from './entities/api-version.entity';
declare class CreateVersionDto {
    version: string;
    path: string;
    supportedFeatures: string[];
    compatibility: {
        minClientVersion: string;
        maxClientVersion: string;
        breakingChanges: {
            description: string;
            affectedEndpoints: string[];
            migrationGuide: string;
        }[];
    };
}
declare class DeprecationPolicyDto {
    announcementDate: Date;
    deprecationDate: Date;
    sunsetDate: Date;
    migrationPath: string;
}
declare class BreakingChangeDto {
    description: string;
    affectedEndpoints: string[];
    migrationGuide: string;
}
declare class UpdateMetricsDto {
    activeClients?: number;
    requestCount?: number;
    errorRate?: number;
}
declare class UpdateDocumentationDto {
    changelog?: string;
    migrationGuides?: string[];
    compatibilityNotes?: string;
}
export declare class ApiVersioningController {
    private readonly versioningService;
    constructor(versioningService: ApiVersioningService);
    createVersion(createVersionDto: CreateVersionDto): Promise<ApiVersion>;
    deprecateVersion(version: string, deprecationPolicyDto: DeprecationPolicyDto): Promise<ApiVersion>;
    sunsetVersion(version: string): Promise<ApiVersion>;
    updateMetrics(version: string, metricsDto: UpdateMetricsDto): Promise<ApiVersion>;
    addBreakingChange(version: string, breakingChangeDto: BreakingChangeDto): Promise<ApiVersion>;
    updateDocumentation(version: string, documentationDto: UpdateDocumentationDto): Promise<ApiVersion>;
    getActiveVersions(): Promise<ApiVersion[]>;
    validateClientVersion(clientVersion: string): Promise<{
        compatible: boolean;
        recommendedVersion?: string;
        migrationGuide?: string;
    }>;
}
export {};
