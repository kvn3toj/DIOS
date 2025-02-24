import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, RequirePermissionOptions } from '../decorators/require-permission.decorator';
import { PermissionService } from '../services/permission.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionOptions = this.reflector.get<RequirePermissionOptions>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!permissionOptions) {
      return true; // No permission requirements
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const requestConditions = {
        ...permissionOptions.conditions,
        ip: request.ip,
        method: request.method,
        path: request.path,
        ...(request.conditions || {}),
      };

      const hasPermission = await this.permissionService.checkPermission({
        userId,
        resourceId: permissionOptions.resource,
        actionId: permissionOptions.action,
        conditions: requestConditions,
      });

      if (!hasPermission) {
        this.logger.warn(
          `Access denied for user ${userId} to ${permissionOptions.resource}:${permissionOptions.action}`,
        );
        return false;
      }

      this.logger.debug(
        `Access granted for user ${userId} to ${permissionOptions.resource}:${permissionOptions.action}`,
      );
      return true;
    } catch (error) {
      this.logger.error('Permission check failed:', error);
      throw new UnauthorizedException('Permission check failed');
    }
  }
} 