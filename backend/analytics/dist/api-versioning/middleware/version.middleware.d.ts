import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiVersioningService } from '../api-versioning.service';
export declare class ApiVersionMiddleware implements NestMiddleware {
    private readonly versioningService;
    constructor(versioningService: ApiVersioningService);
    use(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
