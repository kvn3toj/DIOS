import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SecurityConfigService } from './services/security-config.service';
import { AuthService } from './services/auth.service';
import { AuthorizationService } from './services/authorization.service';
import { SessionService } from './services/session.service';
import { SetupGuideService } from './services/setup-guide.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { PasswordController } from './controllers/password.controller';
import { RegistrationController } from './controllers/registration.controller';
import { SetupGuideController } from './controllers/setup-guide.controller';
import { EmailService } from '../shared/services/email.service';
import { RedisService } from '../shared/services/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionService } from './services/permission.service';
import { PermissionController } from './controllers/permission.controller';
import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { AccessControlMiddleware } from './middleware/access-control.middleware';
import { PermissionGuard } from './guards/permission.guard';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogController } from './controllers/audit-log.controller';
import { UserManagementService } from './services/user-management.service';
import { UserManagementController } from './controllers/user-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityPolicy } from './entities/security-policy.entity';
import { SecurityService } from './services/security.service';
import { SecurityAuditService } from './services/security-audit.service';
import { APP_GUARD } from '@nestjs/core';
import { SecurityGuard } from './guards/security.guard';

@Module({
  imports: [
    ConfigModule,
    EventEmitterModule.forRoot({
      // Configure event emitter for security events
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false
    }),
    TypeOrmModule.forFeature([SecurityPolicy]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
          issuer: configService.get<string>('JWT_ISSUER', 'superapp-gamifier'),
          audience: configService.get<string[]>('JWT_AUDIENCE', ['web', 'mobile']),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    PasswordController,
    RegistrationController,
    SetupGuideController,
    PermissionController,
    RoleController,
    AuditLogController,
    UserManagementController,
  ],
  providers: [
    SecurityConfigService,
    AuthService,
    AuthorizationService,
    SessionService,
    SetupGuideService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    EmailService,
    RedisService,
    PrismaService,
    PermissionService,
    RoleService,
    AccessControlMiddleware,
    PermissionGuard,
    AuditLogService,
    UserManagementService,
    SecurityService,
    SecurityAuditService,
    {
      provide: APP_GUARD,
      useClass: SecurityGuard
    }
  ],
  exports: [
    SecurityConfigService,
    AuthService,
    AuthorizationService,
    SessionService,
    SetupGuideService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    EmailService,
    RedisService,
    PermissionService,
    RoleService,
    AccessControlMiddleware,
    PermissionGuard,
    AuditLogService,
    UserManagementService,
    SecurityService,
    SecurityAuditService
  ],
})
export class SecurityModule {} 