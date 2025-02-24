import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/UserService';
import { APIError } from './errorHandler';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new APIError(401, 'No authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new APIError(401, 'Invalid authorization format');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    if (!decoded || typeof decoded !== 'object') {
      throw new APIError(401, 'Invalid token');
    }

    const userService = new UserService();
    const user = await userService.getUser(decoded.userId);
    if (!user) {
      throw new APIError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new APIError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    if (!decoded || typeof decoded !== 'object') {
      return next();
    }

    const userService = new UserService();
    const user = await userService.getUser(decoded.userId);
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors on invalid tokens
    logger.warn('Optional auth failed:', error);
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new APIError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new APIError(403, 'Insufficient permissions');
    }

    next();
  };
}; 