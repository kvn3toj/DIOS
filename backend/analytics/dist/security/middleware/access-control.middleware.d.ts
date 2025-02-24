import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';
interface AccessControlOptions {
    resource: string;
    action: string;
    conditions?: Record<string, any>;
}
export declare class AccessControlMiddleware implements NestMiddleware {
    private readonly permissionService;
    private readonly logger;
    constructor(permissionService: PermissionService);
    create(options: AccessControlOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export {};
