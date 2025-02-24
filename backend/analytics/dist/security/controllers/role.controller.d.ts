import { RoleService } from '../services/role.service';
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
export declare class RoleController {
    private readonly roleService;
    private readonly logger;
    constructor(roleService: RoleService);
    createRole(dto: CreateRoleDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    updateRole(roleId: string, dto: UpdateRoleDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    deleteRole(roleId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    assignRoleToUser(userId: string, roleId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    removeRoleFromUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getRole(roleId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getRoles(includeSystem?: boolean): Promise<{
        success: boolean;
        data: any;
    }>;
    getUserRole(userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getRolePermissions(roleId: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
export {};
