import { User } from './user.model';
import { Content } from './content.model';

export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked'
}

export enum ActivityType {
  FOLLOW = 'follow',
  COMMENT = 'comment',
  REACTION = 'reaction',
  SHARE = 'share',
  ACHIEVEMENT = 'achievement'
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  CELEBRATE = 'celebrate',
  SUPPORT = 'support',
  INSIGHTFUL = 'insightful'
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    visibility: 'public' | 'private' | 'connections';
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
    achievements: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  blockedAt?: Date;
  blockedBy?: string;
  metadata?: {
    source?: string;
    notes?: string;
    tags?: string[];
  };
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  targetType: 'user' | 'content' | 'achievement';
  targetId: string;
  data: {
    text?: string;
    reactionType?: ReactionType;
    shareUrl?: string;
    achievementId?: string;
    [key: string]: any;
  };
  visibility: 'public' | 'private' | 'connections';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    location?: string;
    device?: string;
    ip?: string;
    [key: string]: any;
  };
}

export interface Comment {
  id: string;
  userId: string;
  contentId: string;
  parentId?: string;
  text: string;
  attachments?: {
    type: 'image' | 'video' | 'link';
    url: string;
    metadata?: Record<string, any>;
  }[];
  reactions?: {
    type: ReactionType;
    count: number;
    users: string[];
  }[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Reaction {
  id: string;
  userId: string;
  targetType: 'content' | 'comment';
  targetId: string;
  type: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Share {
  id: string;
  userId: string;
  contentId: string;
  text?: string;
  platform?: string;
  url: string;
  createdAt: Date;
  metadata?: {
    reach?: number;
    engagement?: number;
    [key: string]: any;
  };
}

export interface ProfileSearchQuery {
  displayName?: string;
  location?: string;
  interests?: string[];
  skills?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ConnectionSearchQuery {
  userId?: string;
  status?: ConnectionStatus;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivitySearchQuery {
  userId?: string;
  type?: ActivityType[];
  targetType?: string;
  targetId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  visibility?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 