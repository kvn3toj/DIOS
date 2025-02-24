export declare enum VersionStatus {
    CURRENT = "current",
    DEPRECATED = "deprecated",
    SUNSET = "sunset"
}
export declare class ApiVersion {
    id: string;
    version: string;
    path: string;
    status: VersionStatus;
    compatibility: {
        minClientVersion: string;
        maxClientVersion: string;
        breakingChanges: {
            description: string;
            affectedEndpoints: string[];
            migrationGuide: string;
        }[];
    };
    deprecationPolicy: {
        announcementDate: Date;
        deprecationDate: Date;
        sunsetDate: Date;
        migrationPath: string;
    };
    metrics: {
        activeClients: number;
        requestCount: number;
        errorRate: number;
        lastUpdated: Date;
    };
    supportedFeatures: string[];
    documentation: {
        changelog: string;
        migrationGuides: string[];
        compatibilityNotes: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
