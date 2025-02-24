import { Request, Response, NextFunction } from 'express';
import {
  requestLogger,
  errorLogger,
  performanceLogger
} from '../../middleware/loggingMiddleware';
import { logger } from '../../utils/logger';
import { APIError } from '../../middleware/errorHandler';

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Logging Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let responseEnd: jest.Mock;
  let responseWrite: jest.Mock;

  beforeEach(() => {
    // Reset time
    jest.useFakeTimers();

    responseEnd = jest.fn();
    responseWrite = jest.fn();

    mockRequest = {
      method: 'GET',
      path: '/test',
      url: '/test?query=value',
      params: { id: '123' },
      query: { query: 'value' },
      body: { data: 'test' },
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '127.0.0.1',
        authorization: 'Bearer test-token'
      },
      ip: '127.0.0.1'
    };

    mockResponse = {
      statusCode: 200,
      getHeader: jest.fn(),
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      }),
      once: jest.fn(),
      emit: jest.fn(),
      write: responseWrite,
      end: responseEnd
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('requestLogger', () => {
    it('should log incoming requests', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.info).toHaveBeenCalledWith('Incoming request:', {
        method: mockRequest.method,
        path: mockRequest.path,
        params: mockRequest.params,
        query: mockRequest.query,
        headers: expect.objectContaining({
          'user-agent': 'test-agent',
          'x-forwarded-for': '127.0.0.1',
          authorization: '[REDACTED]'
        }),
        ip: mockRequest.ip,
        timestamp: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize sensitive information', () => {
      mockRequest.headers = {
        authorization: 'Bearer sensitive-token',
        'x-api-key': 'secret-api-key',
        cookie: 'session=sensitive-data',
        'user-agent': 'test-agent'
      };

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.info).toHaveBeenCalledWith('Incoming request:', expect.objectContaining({
        headers: expect.objectContaining({
          authorization: '[REDACTED]',
          'x-api-key': '[REDACTED]',
          cookie: '[REDACTED]',
          'user-agent': 'test-agent'
        })
      }));
    });

    it('should handle requests without optional fields', () => {
      mockRequest = {
        method: 'GET',
        path: '/test',
        headers: {}
      };

      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.info).toHaveBeenCalledWith('Incoming request:', expect.objectContaining({
        method: 'GET',
        path: '/test',
        headers: {}
      }));
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log response details', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      mockResponse.emit!('finish');

      expect(logger.info).toHaveBeenCalledWith('Response sent:', expect.objectContaining({
        method: mockRequest.method,
        path: mockRequest.path,
        statusCode: mockResponse.statusCode,
        duration: expect.any(String),
        timestamp: expect.any(String)
      }));
    });
  });

  describe('performanceLogger', () => {
    it('should log response time and details', () => {
      performanceLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate some time passing
      jest.advanceTimersByTime(100);

      // Simulate response finish
      mockResponse.emit!('finish');

      expect(logger.debug).toHaveBeenCalledWith('Performance metrics:', expect.objectContaining({
        method: mockRequest.method,
        path: mockRequest.path,
        statusCode: mockResponse.statusCode,
        duration: expect.any(String),
        memory: expect.any(Object),
        timestamp: expect.any(String)
      }));
    });

    it('should log slow requests with warning', () => {
      performanceLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate a slow request (> 1000ms)
      jest.advanceTimersByTime(1500);

      // Simulate response finish
      mockResponse.emit!('finish');

      expect(logger.warn).toHaveBeenCalledWith('Slow request detected:', expect.objectContaining({
        method: mockRequest.method,
        path: mockRequest.path,
        duration: expect.any(String),
        timestamp: expect.any(String)
      }));
    });

    it('should track memory usage', () => {
      performanceLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Simulate response finish
      mockResponse.emit!('finish');

      expect(logger.debug).toHaveBeenCalledWith('Performance metrics:', expect.objectContaining({
        memory: expect.objectContaining({
          heapUsed: expect.any(Number),
          heapTotal: expect.any(Number),
          external: expect.any(Number),
          rss: expect.any(Number)
        })
      }));
    });
  });

  describe('errorLogger', () => {
    it('should log API errors with details', () => {
      const error = new APIError(400, 'Bad Request', { field: 'test' });

      errorLogger(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Request error:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        request: {
          method: mockRequest.method,
          path: mockRequest.path,
          params: mockRequest.params,
          query: mockRequest.query,
          body: mockRequest.body,
          headers: expect.objectContaining({
            authorization: '[REDACTED]'
          }),
          ip: mockRequest.ip
        },
        timestamp: expect.any(String)
      });
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Test error');
      delete error.stack;

      errorLogger(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Request error:', expect.objectContaining({
        error: expect.not.objectContaining({
          stack: expect.any(String)
        })
      }));
    });

    it('should sanitize sensitive information in error logs', () => {
      mockRequest.headers = {
        authorization: 'Bearer sensitive-token',
        'x-api-key': 'secret-api-key',
        cookie: 'session=sensitive-data'
      };
      mockRequest.body = {
        password: 'secret',
        creditCard: '1234-5678-9012-3456',
        user: { email: 'test@example.com' }
      };

      const error = new APIError(400, 'Bad Request');

      errorLogger(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Request error:', expect.objectContaining({
        request: expect.objectContaining({
          headers: expect.objectContaining({
            authorization: '[REDACTED]',
            'x-api-key': '[REDACTED]',
            cookie: '[REDACTED]'
          }),
          body: expect.objectContaining({
            password: '[REDACTED]',
            creditCard: '[REDACTED]',
            user: expect.objectContaining({
              email: 'test@example.com'
            })
          })
        })
      }));
    });

    it('should handle circular references in error objects', () => {
      const circularObj: any = { prop: 'value' };
      circularObj.self = circularObj;

      const error = new Error('Circular reference');
      (error as any).circular = circularObj;

      errorLogger(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(logger.error).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 