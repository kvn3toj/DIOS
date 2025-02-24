import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly securityConfig: SecurityConfigService,
  ) {
    const authConfig = securityConfig.getAuthConfig().jwt;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: authConfig.issuer,
      audience: authConfig.audience,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Add additional validation if needed
      // For example, check if the user still exists in the database
      // or if their access has been revoked

      return {
        userId: payload.sub,
        roles: payload.roles,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 