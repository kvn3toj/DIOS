"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const security_config_service_1 = require("./services/security-config.service");
const auth_service_1 = require("./services/auth.service");
const authorization_service_1 = require("./services/authorization.service");
const session_service_1 = require("./services/session.service");
const setup_guide_service_1 = require("./services/setup-guide.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
const password_controller_1 = require("./controllers/password.controller");
const registration_controller_1 = require("./controllers/registration.controller");
const setup_guide_controller_1 = require("./controllers/setup-guide.controller");
const email_service_1 = require("../shared/services/email.service");
const redis_service_1 = require("../shared/services/redis.service");
const prisma_service_1 = require("../prisma/prisma.service");
const permission_service_1 = require("./services/permission.service");
const permission_controller_1 = require("./controllers/permission.controller");
const role_service_1 = require("./services/role.service");
const role_controller_1 = require("./controllers/role.controller");
const access_control_middleware_1 = require("./middleware/access-control.middleware");
const permission_guard_1 = require("./guards/permission.guard");
const audit_log_service_1 = require("./services/audit-log.service");
const audit_log_controller_1 = require("./controllers/audit-log.controller");
const user_management_service_1 = require("./services/user-management.service");
const user_management_controller_1 = require("./controllers/user-management.controller");
const typeorm_1 = require("@nestjs/typeorm");
const security_policy_entity_1 = require("./entities/security-policy.entity");
const security_service_1 = require("./services/security.service");
const security_audit_service_1 = require("./services/security-audit.service");
const core_1 = require("@nestjs/core");
const security_guard_1 = require("./guards/security.guard");
let SecurityModule = class SecurityModule {
};
exports.SecurityModule = SecurityModule;
exports.SecurityModule = SecurityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 20,
                verboseMemoryLeak: true,
                ignoreErrors: false
            }),
            typeorm_1.TypeOrmModule.forFeature([security_policy_entity_1.SecurityPolicy]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
                        issuer: configService.get('JWT_ISSUER', 'superapp-gamifier'),
                        audience: configService.get('JWT_AUDIENCE', ['web', 'mobile']),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [
            password_controller_1.PasswordController,
            registration_controller_1.RegistrationController,
            setup_guide_controller_1.SetupGuideController,
            permission_controller_1.PermissionController,
            role_controller_1.RoleController,
            audit_log_controller_1.AuditLogController,
            user_management_controller_1.UserManagementController,
        ],
        providers: [
            security_config_service_1.SecurityConfigService,
            auth_service_1.AuthService,
            authorization_service_1.AuthorizationService,
            session_service_1.SessionService,
            setup_guide_service_1.SetupGuideService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            email_service_1.EmailService,
            redis_service_1.RedisService,
            prisma_service_1.PrismaService,
            permission_service_1.PermissionService,
            role_service_1.RoleService,
            access_control_middleware_1.AccessControlMiddleware,
            permission_guard_1.PermissionGuard,
            audit_log_service_1.AuditLogService,
            user_management_service_1.UserManagementService,
            security_service_1.SecurityService,
            security_audit_service_1.SecurityAuditService,
            {
                provide: core_1.APP_GUARD,
                useClass: security_guard_1.SecurityGuard
            }
        ],
        exports: [
            security_config_service_1.SecurityConfigService,
            auth_service_1.AuthService,
            authorization_service_1.AuthorizationService,
            session_service_1.SessionService,
            setup_guide_service_1.SetupGuideService,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            permissions_guard_1.PermissionsGuard,
            email_service_1.EmailService,
            redis_service_1.RedisService,
            permission_service_1.PermissionService,
            role_service_1.RoleService,
            access_control_middleware_1.AccessControlMiddleware,
            permission_guard_1.PermissionGuard,
            audit_log_service_1.AuditLogService,
            user_management_service_1.UserManagementService,
            security_service_1.SecurityService,
            security_audit_service_1.SecurityAuditService
        ],
    })
], SecurityModule);
//# sourceMappingURL=security.module.js.map