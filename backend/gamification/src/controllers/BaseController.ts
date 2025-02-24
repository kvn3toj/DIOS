import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { APIError } from '../middleware/errorHandler';

export abstract class BaseController {
  protected async execute(
    req: Request,
    res: Response,
    next: NextFunction,
    action: () => Promise<any>
  ): Promise<void> {
    try {
      const result = await action();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  protected getPaginationParams(req: Request): { page: number; limit: number } {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    return { page, limit };
  }

  protected getTimeRangeParams(req: Request): { start: Date; end: Date } {
    const start = new Date(req.query.start as string || new Date().setDate(new Date().getDate() - 7));
    const end = new Date(req.query.end as string || new Date());
    return { start, end };
  }

  protected validateRequiredParams(params: Record<string, any>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !params[field]);
    if (missingFields.length > 0) {
      throw new APIError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  protected validateIdParam(id: string): void {
    if (!id) {
      throw new APIError(400, 'ID parameter is required');
    }
  }

  protected validateDateParam(date: string): void {
    if (!date || isNaN(Date.parse(date))) {
      throw new APIError(400, 'Invalid date format');
    }
  }

  protected validateNumberParam(value: string, paramName: string): void {
    const num = Number(value);
    if (isNaN(num)) {
      throw new APIError(400, `Invalid ${paramName} parameter: must be a number`);
    }
  }

  protected validateEnumParam<T>(value: string, enumType: T, paramName: string): void {
    if (!Object.values(enumType).includes(value)) {
      throw new APIError(400, `Invalid ${paramName} parameter: must be one of ${Object.values(enumType).join(', ')}`);
    }
  }

  protected handleSuccess(res: Response, data: any, message?: string): void {
    res.json({
      success: true,
      message,
      data
    });
  }

  protected handleError(error: any, req: Request, res: Response, next: NextFunction): void {
    logger.error('Controller error:', {
      error,
      path: req.path,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body
    });
    next(error);
  }
} 