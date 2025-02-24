import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string, details?: any) {
    super(401, message, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string, details?: any) {
    super(403, message, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, details?: any) {
    super(404, message, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message: string, details?: any) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error handling middleware:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: (error as APIError).details
    },
    request: {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined
      }
    }
  });

  if (error instanceof APIError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        type: error.name,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  // Handle TypeORM errors
  if (error.name === 'QueryFailedError') {
    res.status(400).json({
      success: false,
      error: {
        type: 'DatabaseError',
        message: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        type: 'ValidationError',
        message: error.message,
        details: (error as any).details
      }
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        type: 'AuthenticationError',
        message: 'Invalid or expired token'
      }
    });
    return;
  }

  // Handle unknown errors
  const statusCode = (error as any).statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? error.message 
    : 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      type: 'InternalServerError',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
}; 