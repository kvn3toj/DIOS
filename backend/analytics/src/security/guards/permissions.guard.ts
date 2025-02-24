import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';

interface RequiredPermission {
  resource: string;
  action: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId || !user.roles) {
      return false;
    }

    // Get additional context from request if needed
    const contextData = this.getContextData(request);

    // Check all required permissions
    return this.checkPermissions(user.userId, user.roles, requiredPermissions, contextData);
  }

  private async checkPermissions(
    userId: string,
    roles: string[],
    permissions: RequiredPermission[],
    context?: Record<string, any>,
  ): Promise<boolean> {
    try {
      for (const permission of permissions) {
        const hasPermission = await this.authorizationService.checkPermission(
          userId,
          roles,
          permission.resource,
          permission.action,
          context,
        );

        if (!hasPermission) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  private getContextData(request: any): Record<string, any> {
    // Extract relevant context data from the request
    // This could include things like:
    // - IP address
    // - Request timestamp
    // - Resource IDs from request parameters
    // - Custom headers
    // - etc.

    return {
      ip: request.ip,
      timestamp: new Date(),
      method: request.method,
      path: request.path,
      params: request.params,
      query: request.query,
      headers: {
        userAgent: request.headers['user-agent'],
        origin: request.headers.origin,
      },
    };
  }
} 