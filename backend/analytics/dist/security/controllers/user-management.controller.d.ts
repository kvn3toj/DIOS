import { UserManagementService, CreateUserDto, UpdateUserDto } from '../services/user-management.service';
export declare class UserManagementController {
    private readonly userManagementService;
    private readonly logger;
    constructor(userManagementService: UserManagementService);
    createUser(createUserDto: CreateUserDto): Promise<{
        success: boolean;
        data: any;
    }>;
    updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<{
        success: boolean;
        data: any;
    }>;
    deleteUser(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUser(userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getUsers(search?: string, role?: string, isVerified?: boolean, hasCompletedSetup?: boolean, startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            total: any;
            users: any;
        };
    }>;
    updateUserSetupProgress(userId: string, step: string, completed: boolean): Promise<{
        success: boolean;
        data: any;
    }>;
    completeUserSetup(userId: string): Promise<{
        success: boolean;
        data: {
            user: any;
            setupProgress: any;
        };
    }>;
}
