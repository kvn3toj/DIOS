import { SocialService } from '../services/social.service';
import { Profile, Activity, ConnectionStatus, ActivityType, ReactionType } from '../models/social.model';
export declare class SocialController {
    private readonly socialService;
    private readonly logger;
    constructor(socialService: SocialService);
    createProfile(userId: string, profile: Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<{
        success: boolean;
        data: any;
    }>;
    updateProfile(userId: string, updates: Partial<Profile>): Promise<{
        success: boolean;
        data: any;
    }>;
    getProfile(userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    searchProfiles(displayName?: string, location?: string, createdAfter?: Date, createdBefore?: Date, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: any;
    }>;
    createConnection(requesterId: string, recipientId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateConnectionStatus(connectionId: string, userId: string, status: ConnectionStatus): Promise<{
        success: boolean;
        data: any;
    }>;
    searchConnections(userId?: string, status?: ConnectionStatus, createdAfter?: Date, createdBefore?: Date, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: any;
    }>;
    createActivity(userId: string, activity: Omit<Activity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{
        success: boolean;
        data: any;
    }>;
    searchActivities(userId?: string, type?: ActivityType[], targetType?: string, targetId?: string, visibility?: string, createdAfter?: Date, createdBefore?: Date, limit?: number, offset?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        success: boolean;
        data: any;
    }>;
    createComment(userId: string, contentId: string, text: string, parentId?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateComment(commentId: string, userId: string, text: string): Promise<{
        success: boolean;
        data: any;
    }>;
    deleteComment(commentId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleReaction(userId: string, targetType: string, targetId: string, type: ReactionType): Promise<{
        success: boolean;
        data: any;
    }>;
    createShare(userId: string, contentId: string, platform: string, text?: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
