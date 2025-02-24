import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, optionalAuthMiddleware, requireRole } from '../../middleware/authMiddleware';
import { UserService } from '../../services/UserService';
import { APIError, AuthenticationError } from '../../middleware/errorHandler';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../services/UserService');
jest.mock('../../middleware/errorHandler');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockUser: any;

  beforeEach(() => {
    mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };

    mockRequest = {
      headers: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup UserService mock implementations
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUser.mockResolvedValue(mockUser);

    // Setup JWT mock implementations
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === 'valid-token') {
        return { userId: mockUser.id };
      }
      throw new jwt.JsonWebTokenError('Invalid token');
    });
  });

  describe('authMiddleware', () => {
    it('should authenticate valid token and set user', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String)
      );
      expect(UserService.prototype.getUser).toHaveBeenCalledWith(mockUser.id);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject request without authorization header', async () => {
      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
      expect(mockNext.mock.calls[0][0].message).toBe('No authorization header');
    });

    it('should reject request with invalid authorization format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat valid-token'
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid authorization format');
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
      expect(mockNext.mock.calls[0][0].message).toBe('Invalid token');
    });

    it('should reject request when user not found', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      (UserService as jest.MockedClass<typeof UserService>).prototype.getUser.mockResolvedValue(null);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
      expect(mockNext.mock.calls[0][0].message).toBe('User not found');
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should set user when valid token provided', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };

      await optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should continue without user when no token provided', async () => {
      await optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should continue without user when invalid token provided', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      await optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      mockRequest.user = mockUser;
    });

    it('should allow access with required role', () => {
      const middleware = requireRole(['user']);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should allow access with any of multiple roles', () => {
      const middleware = requireRole(['admin', 'user']);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject access without required role', () => {
      const middleware = requireRole(['admin']);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(APIError)
      );
      expect(mockNext.mock.calls[0][0].message).toBe('Insufficient permissions');
    });

    it('should reject access without authentication', () => {
      const middleware = requireRole(['user']);
      mockRequest.user = undefined;

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(APIError)
      );
      expect(mockNext.mock.calls[0][0].message).toBe('Authentication required');
    });
  });
}); 