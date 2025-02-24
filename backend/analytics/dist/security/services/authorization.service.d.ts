import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityConfigService } from './security-config.service';
interface Permission {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}
interface Role {
    name: string;
    permissions: Permission[];
    inherits?: string[];
}
interface Policy {
    name: string;
    effect: 'allow' | 'deny';
    resources: string[];
    actions: string[];
    conditions?: Record<string, any>;
}
export declare class AuthorizationService {
    private readonly securityConfig;
    private readonly eventEmitter;
    private readonly logger;
    private readonly roles;
    private readonly policies;
    private readonly permissionCache;
    constructor(securityConfig: SecurityConfigService, eventEmitter: EventEmitter2);
    private initializeRBAC;
    createRole(role: Role): Promise<void>;
    updateRole(name: string, updates: Partial<Role>): Promise<void>;
    deleteRole(name: string): Promise<void>;
    createPolicy(policy: Policy): Promise<void>;
    updatePolicy(name: string, updates: Partial<Policy>): Promise<void>;
    deletePolicy(name: string): Promise<void>;
    checkPermission(userId: string, userRoles: string[], resource: string, action: string, context?: Record<string, any>): Promise<boolean>;
    private checkRolePermission;
    private evaluatePolicies;
    private matchesPermission;
    private matchesPolicy;
    private evaluateConditions;
    private generateCacheKey;
    private cachePermissionResult;
    private clearPermissionCache;
}
export {};
