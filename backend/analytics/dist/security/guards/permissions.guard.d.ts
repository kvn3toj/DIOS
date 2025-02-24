import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly authorizationService;
    constructor(reflector: Reflector, authorizationService: AuthorizationService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private checkPermissions;
    private getContextData;
}
