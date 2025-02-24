import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
interface PermissionCheck {
    userId: string;
    resourceId: string;
    actionId: string;
    conditions?: Record<string, any>;
}
interface PermissionGrant {
    userId: string;
    resourceId: string;
    actionId: string;
    conditions?: Record<string, any>;
    isAllowed: boolean;
    expiresAt?: Date;
}
interface RolePermissionGrant {
    roleId: string;
    resourceId: string;
    actionId: string;
    conditions?: Record<string, any>;
    isAllowed: boolean;
}
export declare class PermissionService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    checkPermission({ userId, resourceId, actionId, conditions }: PermissionCheck): Promise<boolean>;
    grantPermission(grant: PermissionGrant): Promise<void>;
    grantRolePermission(grant: RolePermissionGrant): Promise<void>;
    revokePermission(userId: string, resourceId: string, actionId: string): Promise<void>;
    revokeRolePermission(roleId: string, resourceId: string, actionId: string): Promise<void>;
    addRoleInheritance(parentRoleId: string, childRoleId: string): Promise<void>;
    removeRoleInheritance(parentRoleId: string, childRoleId: string): Promise<void>;
    private getRolePermission;
    private checkInheritedPermissions;
    private evaluateConditions;
}
export {};
