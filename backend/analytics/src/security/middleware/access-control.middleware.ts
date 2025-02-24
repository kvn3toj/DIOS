import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';

interface AccessControlOptions {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

@Injectable()
export class AccessControlMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AccessControlMiddleware.name);

  constructor(private readonly permissionService: PermissionService) {}

  create(options: AccessControlOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          throw new UnauthorizedException('User not authenticated');
        }

        // Evaluate request-specific conditions if needed
        const requestConditions = {
          ...options.conditions,
          // Add dynamic conditions based on request
          ip: req.ip,
          method: req.method,
          path: req.path,
          // Add custom conditions from request if needed
          ...(req.conditions || {}),
        };

        const hasPermission = await this.permissionService.checkPermission({
          userId,
          resourceId: options.resource,
          actionId: options.action,
          conditions: requestConditions,
        });

        if (!hasPermission) {
          throw new UnauthorizedException('Insufficient permissions');
        }

        // Log access attempt
        this.logger.debug(`Access granted for user ${userId} to ${options.resource}:${options.action}`);

        next();
      } catch (error) {
        this.logger.error('Access control check failed:', error);
        throw new UnauthorizedException(error.message || 'Access denied');
      }
    };
  }
} 