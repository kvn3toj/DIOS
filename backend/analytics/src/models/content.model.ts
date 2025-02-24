import { User } from './user.model';

export enum ContentType {
  ARTICLE = 'article',
  PAGE = 'page',
  DOCUMENT = 'document',
  MEDIA = 'media',
  TEMPLATE = 'template',
}

export enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface ContentMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  author: string;
  language: string;
  locale: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  content: string;
  metadata: ContentMetadata;
  createdAt: Date;
  createdBy: string;
  changelog?: string;
}

export interface ContentPermissions {
  view: string[];
  edit: string[];
  publish: string[];
  delete: string[];
}

export interface Content {
  id: string;
  type: ContentType;
  status: ContentStatus;
  metadata: ContentMetadata;
  currentVersion: number;
  versions: ContentVersion[];
  permissions: ContentPermissions;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  updatedBy: string;
  publishedBy?: string;
  slug: string;
  path: string;
  parentId?: string;
  order?: number;
  isTemplate: boolean;
  templateId?: string;
  customFields?: Record<string, any>;
}

export interface ContentSearchQuery {
  type?: ContentType[];
  status?: ContentStatus[];
  author?: string;
  categories?: string[];
  tags?: string[];
  language?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  publishedAfter?: Date;
  publishedBefore?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 