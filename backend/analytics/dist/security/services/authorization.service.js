"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthorizationService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const security_config_service_1 = require("./security-config.service");
let AuthorizationService = AuthorizationService_1 = class AuthorizationService {
    constructor(securityConfig, eventEmitter) {
        this.securityConfig = securityConfig;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AuthorizationService_1.name);
        this.roles = new Map();
        this.policies = new Map();
        this.permissionCache = new Map();
        this.initializeRBAC();
    }
    initializeRBAC() {
        const authzConfig = this.securityConfig.getAuthzConfig();
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
        this.policies.set('default-deny', {
            name: 'default-deny',
            effect: 'deny',
            resources: ['*'],
            actions: ['*'],
        });
        this.logger.log('RBAC system initialized');
    }
    async createRole(role) {
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
        }
        catch (error) {
            this.logger.error('Failed to create role', error);
            throw error;
        }
    }
    async updateRole(name, updates) {
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
        }
        catch (error) {
            this.logger.error('Failed to update role', error);
            throw error;
        }
    }
    async deleteRole(name) {
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
        }
        catch (error) {
            this.logger.error('Failed to delete role', error);
            throw error;
        }
    }
    async createPolicy(policy) {
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
        }
        catch (error) {
            this.logger.error('Failed to create policy', error);
            throw error;
        }
    }
    async updatePolicy(name, updates) {
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
        }
        catch (error) {
            this.logger.error('Failed to update policy', error);
            throw error;
        }
    }
    async deletePolicy(name) {
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
        }
        catch (error) {
            this.logger.error('Failed to delete policy', error);
            throw error;
        }
    }
    async checkPermission(userId, userRoles, resource, action, context) {
        try {
            const cacheKey = this.generateCacheKey(userId, userRoles, resource, action);
            const cachedResult = this.permissionCache.get(cacheKey);
            if (cachedResult !== undefined) {
                return cachedResult;
            }
            const authzConfig = this.securityConfig.getAuthzConfig();
            if (userRoles.includes(authzConfig.rbac.superAdminRole)) {
                this.cachePermissionResult(cacheKey, true);
                return true;
            }
            for (const roleName of userRoles) {
                const role = this.roles.get(roleName);
                if (!role)
                    continue;
                const hasPermission = await this.checkRolePermission(role, resource, action, context);
                if (hasPermission) {
                    this.cachePermissionResult(cacheKey, true);
                    return true;
                }
            }
            const policyResult = await this.evaluatePolicies(resource, action, context);
            this.cachePermissionResult(cacheKey, policyResult);
            return policyResult;
        }
        catch (error) {
            this.logger.error('Permission check failed', error);
            throw new common_1.ForbiddenException('Permission check failed');
        }
    }
    async checkRolePermission(role, resource, action, context) {
        for (const permission of role.permissions) {
            if (this.matchesPermission(permission, resource, action, context)) {
                return true;
            }
        }
        if (role.inherits) {
            for (const inheritedRole of role.inherits) {
                const parentRole = this.roles.get(inheritedRole);
                if (parentRole) {
                    const hasPermission = await this.checkRolePermission(parentRole, resource, action, context);
                    if (hasPermission)
                        return true;
                }
            }
        }
        return false;
    }
    async evaluatePolicies(resource, action, context) {
        let allow = false;
        for (const policy of this.policies.values()) {
            if (this.matchesPolicy(policy, resource, action, context)) {
                if (policy.effect === 'deny')
                    return false;
                allow = true;
            }
        }
        return allow;
    }
    matchesPermission(permission, resource, action, context) {
        if (permission.resource !== '*' && permission.resource !== resource)
            return false;
        if (permission.action !== '*' && permission.action !== action)
            return false;
        if (permission.conditions && context) {
            return this.evaluateConditions(permission.conditions, context);
        }
        return true;
    }
    matchesPolicy(policy, resource, action, context) {
        const matchesResource = policy.resources.some(r => r === '*' || r === resource);
        const matchesAction = policy.actions.some(a => a === '*' || a === action);
        if (!matchesResource || !matchesAction)
            return false;
        if (policy.conditions && context) {
            return this.evaluateConditions(policy.conditions, context);
        }
        return true;
    }
    evaluateConditions(conditions, context) {
        for (const [key, value] of Object.entries(conditions)) {
            if (context[key] !== value)
                return false;
        }
        return true;
    }
    generateCacheKey(userId, roles, resource, action) {
        return `${userId}:${roles.sort().join(',')}:${resource}:${action}`;
    }
    cachePermissionResult(key, result) {
        const { maxCacheAge } = this.securityConfig.getAuthzConfig().policies;
        this.permissionCache.set(key, result);
        setTimeout(() => {
            this.permissionCache.delete(key);
        }, maxCacheAge * 1000);
    }
    clearPermissionCache() {
        this.permissionCache.clear();
        this.logger.debug('Permission cache cleared');
    }
};
exports.AuthorizationService = AuthorizationService;
exports.AuthorizationService = AuthorizationService = AuthorizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [security_config_service_1.SecurityConfigService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], AuthorizationService);
//# sourceMappingURL=authorization.service.js.map