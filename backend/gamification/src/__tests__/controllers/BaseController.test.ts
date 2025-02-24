import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../controllers/BaseController';
import { APIError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

// Mock logger to prevent actual logging during tests
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

class TestController extends BaseController {
  public async testExecute(req: Request, res: Response, next: NextFunction, shouldThrow = false): Promise<void> {
    await this.execute(req, res, next, async () => {
      if (shouldThrow) {
        throw new APIError(400, 'Test error');
      }
      return { success: true };
    });
  }

  public testGetPaginationParams(req: Request): { page: number; limit: number } {
    return this.getPaginationParams(req);
  }

  public testGetTimeRangeParams(req: Request): { start: Date; end: Date } {
    return this.getTimeRangeParams(req);
  }

  public testValidateRequiredParams(params: Record<string, any>, requiredFields: string[]): void {
    return this.validateRequiredParams(params, requiredFields);
  }

  public testValidateIdParam(id: string): void {
    return this.validateIdParam(id);
  }

  public testValidateDateParam(date: string): void {
    return this.validateDateParam(date);
  }

  public testValidateNumberParam(value: string, paramName: string): void {
    return this.validateNumberParam(value, paramName);
  }

  public testValidateEnumParam<T>(value: string, enumType: T, paramName: string): void {
    return this.validateEnumParam(value, enumType, paramName);
  }

  public testHandleSuccess(res: Response, data: any, message?: string): void {
    return this.handleSuccess(res, data, message);
  }

  public testHandleError(error: any, req: Request, res: Response, next: NextFunction): void {
    return this.handleError(error, req, res, next);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    controller = new TestController();
    mockRequest = {
      path: '/test',
      method: 'GET',
      params: {},
      query: {},
      body: {},
      headers: {}
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should handle successful execution', async () => {
      await controller.testExecute(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      await controller.testExecute(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
        true
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
      expect(mockNext.mock.calls[0][0].message).toBe('Test error');
    });
  });

  describe('getPaginationParams', () => {
    it('should return default pagination values', () => {
      const result = controller.testGetPaginationParams(mockRequest as Request);
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should parse provided pagination values', () => {
      mockRequest.query = { page: '2', limit: '20' };
      const result = controller.testGetPaginationParams(mockRequest as Request);
      expect(result).toEqual({ page: 2, limit: 20 });
    });
  });

  describe('getTimeRangeParams', () => {
    it('should return default time range', () => {
      const result = controller.testGetTimeRangeParams(mockRequest as Request);
      expect(result.start).toBeInstanceOf(Date);
      expect(result.end).toBeInstanceOf(Date);
    });

    it('should parse provided time range', () => {
      const start = '2023-01-01';
      const end = '2023-12-31';
      mockRequest.query = { start, end };
      const result = controller.testGetTimeRangeParams(mockRequest as Request);
      expect(result.start).toEqual(new Date(start));
      expect(result.end).toEqual(new Date(end));
    });
  });

  describe('validateRequiredParams', () => {
    it('should not throw for valid params', () => {
      const params = { name: 'test', value: 123 };
      expect(() => {
        controller.testValidateRequiredParams(params, ['name', 'value']);
      }).not.toThrow();
    });

    it('should throw for missing params', () => {
      const params = { name: 'test' };
      expect(() => {
        controller.testValidateRequiredParams(params, ['name', 'value']);
      }).toThrow(APIError);
    });
  });

  describe('validateIdParam', () => {
    it('should not throw for valid id', () => {
      expect(() => {
        controller.testValidateIdParam('valid-id');
      }).not.toThrow();
    });

    it('should throw for empty id', () => {
      expect(() => {
        controller.testValidateIdParam('');
      }).toThrow(APIError);
    });
  });

  describe('validateDateParam', () => {
    it('should not throw for valid date', () => {
      expect(() => {
        controller.testValidateDateParam('2023-01-01');
      }).not.toThrow();
    });

    it('should throw for invalid date', () => {
      expect(() => {
        controller.testValidateDateParam('invalid-date');
      }).toThrow(APIError);
    });
  });

  describe('validateNumberParam', () => {
    it('should not throw for valid number', () => {
      expect(() => {
        controller.testValidateNumberParam('123', 'test');
      }).not.toThrow();
    });

    it('should throw for invalid number', () => {
      expect(() => {
        controller.testValidateNumberParam('not-a-number', 'test');
      }).toThrow(APIError);
    });
  });

  describe('validateEnumParam', () => {
    enum TestEnum {
      A = 'A',
      B = 'B'
    }

    it('should not throw for valid enum value', () => {
      expect(() => {
        controller.testValidateEnumParam('A', TestEnum, 'test');
      }).not.toThrow();
    });

    it('should throw for invalid enum value', () => {
      expect(() => {
        controller.testValidateEnumParam('C', TestEnum, 'test');
      }).toThrow(APIError);
    });
  });

  describe('handleSuccess', () => {
    it('should send success response', () => {
      const data = { test: true };
      const message = 'Test success';
      
      controller.testHandleSuccess(mockResponse as Response, data, message);

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message,
        data
      });
    });
  });

  describe('handleError', () => {
    it('should log and forward error', () => {
      const error = new Error('Test error');
      
      controller.testHandleError(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(logger.error).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle APIError with details', () => {
      const error = new APIError(400, 'Test error', { field: 'test' });
      
      controller.testHandleError(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(logger.error).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 