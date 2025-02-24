import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityConfigService } from './security-config.service';

interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[];
}

interface Policy {
  name: string;
  effect: 'allow' | 'deny';
  resources: string[];
  actions: string[];
  conditions?: Record<string, any>;
}

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);
  private readonly roles = new Map<string, Role>();
  private readonly policies = new Map<string, Policy>();
  private readonly permissionCache = new Map<string, boolean>();

  constructor(
    private readonly securityConfig: SecurityConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeRBAC();
  }

  private initializeRBAC() {
    const authzConfig = this.securityConfig.getAuthzConfig();

    // Initialize default roles
    this.roles.set(authzConfig.rbac.superAdminRole, {
      name: authzConfig.rbac.superAdminRole,
      permissions: [{ resource: '*', action: '*' }],
    });

    this.roles.set(authzConfig.rbac.defaultRole, {
      name: authzConfig.rbac.defaultRole,
      permissions: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' },
      ],
    });

    // Initialize default policies
    this.policies.set('default-deny', {
      name: 'default-deny',
      effect: 'deny',
      resources: ['*'],
      actions: ['*'],
    });

    this.logger.log('RBAC system initialized');
  }

  async createRole(role: Role): Promise<void> {
    try {
      if (this.roles.has(role.name)) {
        throw new Error(`Role ${role.name} already exists`);
      }

      this.roles.set(role.name, role);
      this.clearPermissionCache();

      this.eventEmitter.emit('authorization.role.created', {
        role: role.name,
        timestamp: new Date(),
      });

      this.logger.log(`Role ${role.name} created`);
    } catch (error) {
      this.logger.error('Failed to create role', error);
      throw error;
    }
  }

  async updateRole(name: string, updates: Partial<Role>): Promise<void> {
    try {
      const role = this.roles.get(name);
      if (!role) {
        throw new Error(`Role ${name} not found`);
      }

      const updatedRole = { ...role, ...updates };
      this.roles.set(name, updatedRole);
      this.clearPermissionCache();

      this.eventEmitter.emit('authorization.role.updated', {
        role: name,
        updates,
        timestamp: new Date(),
      });

      this.logger.log(`Role ${name} updated`);
    } catch (error) {
      this.logger.error('Failed to update role', error);
      throw error;
    }
  }

  async deleteRole(name: string): Promise<void> {
    try {
      const authzConfig = this.securityConfig.getAuthzConfig();
      if (name === authzConfig.rbac.superAdminRole || name === authzConfig.rbac.defaultRole) {
        throw new Error(`Cannot delete system role: ${name}`);
      }

      if (!this.roles.delete(name)) {
        throw new Error(`Role ${name} not found`);
      }

      this.clearPermissionCache();

      this.eventEmitter.emit('authorization.role.deleted', {
        role: name,
        timestamp: new Date(),
      });

      this.logger.log(`Role ${name} deleted`);
    } catch (error) {
      this.logger.error('Failed to delete role', error);
      throw error;
    }
  }

  async createPolicy(policy: Policy): Promise<void> {
    try {
      if (this.policies.has(policy.name)) {
        throw new Error(`Policy ${policy.name} already exists`);
      }

      this.policies.set(policy.name, policy);
      this.clearPermissionCache();

      this.eventEmitter.emit('authorization.policy.created', {
        policy: policy.name,
        timestamp: new Date(),
      });

      this.logger.log(`Policy ${policy.name} created`);
    } catch (error) {
      this.logger.error('Failed to create policy', error);
      throw error;
    }
  }

  async updatePolicy(name: string, updates: Partial<Policy>): Promise<void> {
    try {
      const policy = this.policies.get(name);
      if (!policy) {
        throw new Error(`Policy ${name} not found`);
      }

      const updatedPolicy = { ...policy, ...updates };
      this.policies.set(name, updatedPolicy);
      this.clearPermissionCache();

      this.eventEmitter.emit('authorization.policy.updated', {
        policy: name,
        updates,
        timestamp: new Date(),
      });

      this.logger.log(`Policy ${name} updated`);
    } catch (error) {
      this.logger.error('Failed to update policy', error);
      throw error;
    }
  }

  async deletePolicy(name: string): Promise<void> {
    try {
      if (name === 'default-deny') {
        throw new Error('Cannot delete default-deny policy');
      }

      if (!this.policies.delete(name)) {
        throw new Error(`Policy ${name} not found`);
      }

      this.clearPermissionCache();

      this.eventEmitter.emit('authorization.policy.deleted', {
        policy: name,
        timestamp: new Date(),
      });

      this.logger.log(`Policy ${name} deleted`);
    } catch (error) {
      this.logger.error('Failed to delete policy', error);
      throw error;
    }
  }

  async checkPermission(
    userId: string,
    userRoles: string[],
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const cacheKey = this.generateCacheKey(userId, userRoles, resource, action);
      const cachedResult = this.permissionCache.get(cacheKey);

      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const authzConfig = this.securityConfig.getAuthzConfig();

      // Super admin has all permissions
      if (userRoles.includes(authzConfig.rbac.superAdminRole)) {
        this.cachePermissionResult(cacheKey, true);
        return true;
      }

      // Check role-based permissions
      for (const roleName of userRoles) {
        const role = this.roles.get(roleName);
        if (!role) continue;

        const hasPermission = await this.checkRolePermission(role, resource, action, context);
        if (hasPermission) {
          this.cachePermissionResult(cacheKey, true);
          return true;
        }
      }

      // Check policies
      const policyResult = await this.evaluatePolicies(resource, action, context);
      this.cachePermissionResult(cacheKey, policyResult);

      return policyResult;
    } catch (error) {
      this.logger.error('Permission check failed', error);
      throw new ForbiddenException('Permission check failed');
    }
  }

  private async checkRolePermission(
    role: Role,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<boolean> {
    // Check direct permissions
    for (const permission of role.permissions) {
      if (this.matchesPermission(permission, resource, action, context)) {
        return true;
      }
    }

    // Check inherited permissions
    if (role.inherits) {
      for (const inheritedRole of role.inherits) {
        const parentRole = this.roles.get(inheritedRole);
        if (parentRole) {
          const hasPermission = await this.checkRolePermission(parentRole, resource, action, context);
          if (hasPermission) return true;
        }
      }
    }

    return false;
  }

  private async evaluatePolicies(
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<boolean> {
    let allow = false;

    for (const policy of this.policies.values()) {
      if (this.matchesPolicy(policy, resource, action, context)) {
        if (policy.effect === 'deny') return false;
        allow = true;
      }
    }

    return allow;
  }

  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): boolean {
    if (permission.resource !== '*' && permission.resource !== resource) return false;
    if (permission.action !== '*' && permission.action !== action) return false;

    if (permission.conditions && context) {
      return this.evaluateConditions(permission.conditions, context);
    }

    return true;
  }

  private matchesPolicy(
    policy: Policy,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): boolean {
    const matchesResource = policy.resources.some(r => r === '*' || r === resource);
    const matchesAction = policy.actions.some(a => a === '*' || a === action);

    if (!matchesResource || !matchesAction) return false;

    if (policy.conditions && context) {
      return this.evaluateConditions(policy.conditions, context);
    }

    return true;
  }

  private evaluateConditions(conditions: Record<string, any>, context: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) return false;
    }
    return true;
  }

  private generateCacheKey(
    userId: string,
    roles: string[],
    resource: string,
    action: string,
  ): string {
    return `${userId}:${roles.sort().join(',')}:${resource}:${action}`;
  }

  private cachePermissionResult(key: string, result: boolean): void {
    const { maxCacheAge } = this.securityConfig.getAuthzConfig().policies;
    this.permissionCache.set(key, result);

    // Clear cache entry after maxCacheAge
    setTimeout(() => {
      this.permissionCache.delete(key);
    }, maxCacheAge * 1000);
  }

  private clearPermissionCache(): void {
    this.permissionCache.clear();
    this.logger.debug('Permission cache cleared');
  }
} 