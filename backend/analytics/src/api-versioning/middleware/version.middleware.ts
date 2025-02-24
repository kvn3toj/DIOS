import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiVersioningService } from '../api-versioning.service';

@Injectable()
export class ApiVersionMiddleware implements NestMiddleware {
  constructor(private readonly versioningService: ApiVersioningService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientVersion = req.headers['x-api-version'] as string;
    
    if (!clientVersion) {
      throw new BadRequestException('API version header (x-api-version) is required');
    }

    const validation = await this.versioningService.validateClientVersion(clientVersion);

    if (!validation.compatible) {
      return res.status(426).json({
        error: 'Upgrade Required',
        message: 'Your client version is not compatible with the current API version',
        recommendedVersion: validation.recommendedVersion,
        migrationGuide: validation.migrationGuide
      });
    }

    // Add version info to request for logging and metrics
    req['apiVersion'] = {
      clientVersion,
      timestamp: new Date()
    };

    next();
  }
} 