import { ConfigService } from '@nestjs/config';
import { SecurityConfigService } from '../services/security-config.service';
interface JwtPayload {
    sub: string;
    roles: string[];
    type: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string[];
}
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly securityConfig;
    constructor(configService: ConfigService, securityConfig: SecurityConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        roles: string[];
    }>;
}
export {};
