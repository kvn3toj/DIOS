import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from './audit-log.service';
import { RoleService } from './role.service';
export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: string;
}
export interface UpdateUserDto {
    email?: string;
    name?: string;
    role?: string;
    isVerified?: boolean;
    hasCompletedSetup?: boolean;
}
export interface UserFilters {
    search?: string;
    role?: string;
    isVerified?: boolean;
    hasCompletedSetup?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}
export declare class UserManagementService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly auditLogService;
    private readonly roleService;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2, auditLogService: AuditLogService, roleService: RoleService);
    createUser(createUserDto: CreateUserDto, creatorId?: string): Promise<any>;
    updateUser(userId: string, updateUserDto: UpdateUserDto, updaterId?: string): Promise<any>;
    deleteUser(userId: string, deleterId?: string): Promise<boolean>;
    getUser(userId: string): Promise<any>;
    getUsers(filters: UserFilters): Promise<{
        total: any;
        users: any;
    }>;
    updateUserSetupProgress(userId: string, step: string, completed: boolean): Promise<any>;
    completeUserSetup(userId: string): Promise<{
        user: any;
        setupProgress: any;
    }>;
}
