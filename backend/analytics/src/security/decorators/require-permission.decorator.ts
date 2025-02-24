import { SetMetadata } from '@nestjs/common';

export interface RequirePermissionOptions {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (options: RequirePermissionOptions) =>
  SetMetadata(PERMISSION_KEY, options); 