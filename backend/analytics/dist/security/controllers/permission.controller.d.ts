import { PermissionService } from '../services/permission.service';
interface GrantPermissionDto {
    userId: string;
    resourceId: string;
    actionId: string;
    conditions?: Record<string, any>;
    isAllowed: boolean;
    expiresAt?: Date;
}
interface GrantRolePermissionDto {
    roleId: string;
    resourceId: string;
    actionId: string;
    conditions?: Record<string, any>;
    isAllowed: boolean;
}
interface RoleInheritanceDto {
    parentRoleId: string;
    childRoleId: string;
}
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    grantPermission(grant: GrantPermissionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    grantRolePermission(grant: GrantRolePermissionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    revokePermission(userId: string, resourceId: string, actionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    revokeRolePermission(roleId: string, resourceId: string, actionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    addRoleInheritance(inheritance: RoleInheritanceDto): Promise<{
        success: boolean;
        message: string;
    }>;
    removeRoleInheritance(parentRoleId: string, childRoleId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    checkPermission(userId: string, resourceId: string, actionId: string, conditions?: string): Promise<{
        success: boolean;
        hasPermission: boolean;
    }>;
}
export {};
