import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionService } from './permission.service';
interface CreateRoleDto {
    name: string;
    description?: string;
    isSystem?: boolean;
    permissions?: {
        resourceId: string;
        actionId: string;
        conditions?: Record<string, any>;
        isAllowed: boolean;
    }[];
}
interface UpdateRoleDto {
    name?: string;
    description?: string;
    isSystem?: boolean;
}
export declare class RoleService {
    private readonly prisma;
    private readonly permissionService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, permissionService: PermissionService, eventEmitter: EventEmitter2);
    createRole(dto: CreateRoleDto): Promise<any>;
    updateRole(roleId: string, dto: UpdateRoleDto): Promise<any>;
    deleteRole(roleId: string): Promise<void>;
    assignRoleToUser(userId: string, roleId: string): Promise<void>;
    removeRoleFromUser(userId: string): Promise<void>;
    getRoleById(roleId: string): Promise<any>;
    getRoles(includeSystem?: boolean): Promise<any>;
    getUserRole(userId: string): Promise<any>;
    getRolePermissions(roleId: string): Promise<any>;
}
export {};
