import { Request, Response, NextFunction } from 'express';
import {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler
} from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/test',
      params: {},
      query: {},
      body: {},
      headers: {
        authorization: 'Bearer test-token'
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      get: jest.fn()
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Error Classes', () => {
    it('should create APIError with correct properties', () => {
      const error = new APIError(400, 'Bad Request', { field: 'test' });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('APIError');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input', { field: 'test' });

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should create AuthenticationError with correct properties', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('AuthenticationError');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });

    it('should create AuthorizationError with correct properties', () => {
      const error = new AuthorizationError('Insufficient permissions');

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('AuthorizationError');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
    });

    it('should create NotFoundError with correct properties', () => {
      const error = new NotFoundError('Resource not found');

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('NotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create ConflictError with correct properties', () => {
      const error = new ConflictError('Resource already exists');

      expect(error).toBeInstanceOf(APIError);
      expect(error.name).toBe('ConflictError');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle APIError', () => {
      const error = new APIError(400, 'Bad Request', { field: 'test' });

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'APIError',
          message: 'Bad Request',
          details: { field: 'test' }
        }
      });
    });

    it('should handle ValidationError', () => {
      const error = new ValidationError('Invalid input', { field: 'test' });

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'ValidationError',
          message: 'Invalid input',
          details: { field: 'test' }
        }
      });
    });

    it('should handle QueryFailedError', () => {
      const error = Object.assign(new Error('Database error'), {
        name: 'QueryFailedError'
      });

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'DatabaseError',
          message: 'Database operation failed',
          details: process.env.NODE_ENV === 'development' ? 'Database error' : undefined
        }
      });
    });

    it('should handle JWT errors', () => {
      const error = Object.assign(new Error('Token expired'), {
        name: 'TokenExpiredError'
      });

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'AuthenticationError',
          message: 'Invalid or expired token'
        }
      });
    });

    it('should handle unknown errors in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Unknown error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'InternalServerError',
          message: 'Unknown error',
          stack: error.stack
        }
      });
    });

    it('should handle unknown errors in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Unknown error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'InternalServerError',
          message: 'An unexpected error occurred'
        }
      });
    });

    it('should log error details', () => {
      const error = new APIError(400, 'Bad Request');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(logger.error).toHaveBeenCalledWith('Error handling middleware:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          details: error.details
        },
        request: {
          method: mockRequest.method,
          path: mockRequest.path,
          params: mockRequest.params,
          query: mockRequest.query,
          body: mockRequest.body,
          headers: {
            ...mockRequest.headers,
            authorization: '[REDACTED]'
          }
        }
      });
    });
  });
}); 