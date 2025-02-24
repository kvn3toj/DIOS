import { Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validationMiddleware';
import { ValidationError } from '../../middleware/errorHandler';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  describe('validate middleware', () => {
    const testSchema = z.object({
      body: z.object({
        name: z.string().min(3),
        email: z.string().email(),
        age: z.number().min(18).optional()
      }),
      params: z.object({
        id: z.string().uuid().optional()
      }),
      query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional()
      })
    });

    it('should pass validation with valid data', () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25
        },
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000'
        },
        query: {
          page: '1',
          limit: '10'
        }
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockRequest.body.age).toBe(25);
      expect(mockRequest.query.page).toBe(1);
      expect(mockRequest.query.limit).toBe(10);
    });

    it('should pass validation with optional fields omitted', () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        params: {},
        query: {}
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it('should fail validation with invalid body data', () => {
      mockRequest = {
        body: {
          name: 'Jo', // too short
          email: 'invalid-email',
          age: 15 // too young
        },
        params: {},
        query: {}
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
      expect(mockNext.mock.calls[0][0].details).toEqual(
        expect.objectContaining({
          body: expect.arrayContaining([
            expect.objectContaining({
              path: ['name'],
              message: expect.any(String)
            }),
            expect.objectContaining({
              path: ['email'],
              message: expect.any(String)
            }),
            expect.objectContaining({
              path: ['age'],
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('should fail validation with invalid params', () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        params: {
          id: 'invalid-uuid'
        },
        query: {}
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
      expect(mockNext.mock.calls[0][0].details).toEqual(
        expect.objectContaining({
          params: expect.arrayContaining([
            expect.objectContaining({
              path: ['id'],
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('should fail validation with invalid query parameters', () => {
      mockRequest = {
        body: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        params: {},
        query: {
          page: 'invalid',
          limit: '-10'
        }
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
      expect(mockNext.mock.calls[0][0].details).toEqual(
        expect.objectContaining({
          query: expect.arrayContaining([
            expect.objectContaining({
              path: ['page'],
              message: expect.any(String)
            }),
            expect.objectContaining({
              path: ['limit'],
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('should handle nested object validation', () => {
      const nestedSchema = z.object({
        body: z.object({
          user: z.object({
            profile: z.object({
              firstName: z.string().min(2),
              lastName: z.string().min(2),
              address: z.object({
                street: z.string(),
                city: z.string(),
                country: z.string()
              })
            })
          })
        })
      });

      mockRequest = {
        body: {
          user: {
            profile: {
              firstName: 'J', // too short
              lastName: 'Doe',
              address: {
                street: '123 Main St',
                city: '', // empty string
                country: 'USA'
              }
            }
          }
        }
      };

      const middleware = validate(nestedSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
      expect(mockNext.mock.calls[0][0].details).toEqual(
        expect.objectContaining({
          body: expect.arrayContaining([
            expect.objectContaining({
              path: ['user', 'profile', 'firstName'],
              message: expect.any(String)
            }),
            expect.objectContaining({
              path: ['user', 'profile', 'address', 'city'],
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('should handle array validation', () => {
      const arraySchema = z.object({
        body: z.object({
          items: z.array(z.object({
            id: z.number(),
            name: z.string().min(3)
          })).min(1)
        })
      });

      mockRequest = {
        body: {
          items: [
            { id: 1, name: 'Valid' },
            { id: 2, name: 'Ok' },
            { id: '3', name: 'A' } // invalid id type and name too short
          ]
        }
      };

      const middleware = validate(arraySchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
      expect(mockNext.mock.calls[0][0].details).toEqual(
        expect.objectContaining({
          body: expect.arrayContaining([
            expect.objectContaining({
              path: ['items', 2, 'id'],
              message: expect.any(String)
            }),
            expect.objectContaining({
              path: ['items', 2, 'name'],
              message: expect.any(String)
            })
          ])
        })
      );
    });

    it('should handle custom validation rules', () => {
      const customSchema = z.object({
        body: z.object({
          password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
          confirmPassword: z.string()
        }).refine((data) => data.password === data.confirmPassword, {
          message: "Passwords don't match",
          path: ['confirmPassword']
        })
      });

      mockRequest = {
        body: {
          password: 'weak',
          confirmPassword: 'different'
        }
      };

      const middleware = validate(customSchema);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.any(ValidationError)
      );
      expect(mockNext.mock.calls[0][0].details).toEqual(
        expect.objectContaining({
          body: expect.arrayContaining([
            expect.objectContaining({
              path: ['password'],
              message: expect.any(String)
            }),
            expect.objectContaining({
              path: ['confirmPassword'],
              message: "Passwords don't match"
            })
          ])
        })
      );
    });
  });
}); 