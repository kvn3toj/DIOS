export declare enum SecurityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class SecurityPolicy {
    id: string;
    name: string;
    level: SecurityLevel;
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        maxAge: number;
        preventReuse: number;
    };
    mfaPolicy: {
        required: boolean;
        allowedMethods: string[];
        gracePeriod: number;
        rememberDevice: boolean;
        rememberPeriod: number;
    };
    sessionPolicy: {
        maxConcurrentSessions: number;
        sessionTimeout: number;
        extendOnActivity: boolean;
        requireReauthForSensitive: boolean;
        mobileSessionTimeout: number;
    };
    rateLimit: {
        loginAttempts: number;
        loginBlockDuration: number;
        apiRequestsPerMinute: number;
        apiBlockDuration: number;
    };
    auditPolicy: {
        logLevel: string;
        retentionPeriod: number;
        sensitiveActions: string[];
        alertThresholds: {
            failedLogins: number;
            suspiciousActivities: number;
        };
    };
    encryptionSettings: {
        algorithm: string;
        keyRotationPeriod: number;
        minimumKeyLength: number;
    };
    isActive: boolean;
    appliedTo: string[];
    createdAt: Date;
    updatedAt: Date;
}
