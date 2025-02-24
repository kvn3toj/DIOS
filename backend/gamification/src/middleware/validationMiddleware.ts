import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from './errorHandler';
import { logger } from '../utils/logger';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', {
          path: req.path,
          errors: error.errors
        });
        next(new ValidationError('Request validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
};

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1) {
    next(new ValidationError('Page number must be greater than 0'));
    return;
  }

  if (limit < 1 || limit > 100) {
    next(new ValidationError('Limit must be between 1 and 100'));
    return;
  }

  req.query.page = page.toString();
  req.query.limit = limit.toString();
  next();
};

export const validateTimeRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = req.query.start ? new Date(req.query.start as string) : undefined;
  const end = req.query.end ? new Date(req.query.end as string) : undefined;

  if (start && isNaN(start.getTime())) {
    next(new ValidationError('Invalid start date format'));
    return;
  }

  if (end && isNaN(end.getTime())) {
    next(new ValidationError('Invalid end date format'));
    return;
  }

  if (start && end && start > end) {
    next(new ValidationError('Start date must be before end date'));
    return;
  }

  next();
};

export const validateId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = req.params.id;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!id || !uuidRegex.test(id)) {
    next(new ValidationError('Invalid ID format'));
    return;
  }

  next();
};

export const validateEnum = (enumType: any, paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName] || req.query[paramName] || req.body[paramName];
    
    if (!value || !Object.values(enumType).includes(value)) {
      next(new ValidationError(
        `Invalid ${paramName}. Must be one of: ${Object.values(enumType).join(', ')}`
      ));
      return;
    }

    next();
  };
}; 