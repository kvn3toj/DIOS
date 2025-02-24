export interface RequirePermissionOptions {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}
export declare const PERMISSION_KEY = "permission";
export declare const RequirePermission: (options: RequirePermissionOptions) => import("@nestjs/common").CustomDecorator<string>;
