import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { createCustomMetric } from '../config/monitoring';
import { logger } from '../utils/logger';

const redis = new Redis(process.env.REDIS_URL);

// Cache configuration
const CACHE_TTL = 300; // 5 minutes
const CACHE_ENABLED_ROUTES = [
  '/api/v1/achievements',
  '/api/v1/quests',
  '/api/v1/leaderboard',
];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

// Response compression threshold
const COMPRESSION_THRESHOLD = 1024; // 1KB

// Query optimization
interface QueryOptimization {
  maxLimit: number;
  defaultLimit: number;
  maxDepth: number;
}

const QUERY_OPTIMIZATION: QueryOptimization = {
  maxLimit: 100,
  defaultLimit: 10,
  maxDepth: 3,
};

// Cache middleware
export const cacheMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!CACHE_ENABLED_ROUTES.includes(req.path) || req.method !== 'GET') {
    return next();
  }

  const cacheKey = `cache:${req.originalUrl}`;

  try {
    const cachedResponse = await redis.get(cacheKey);

    if (cachedResponse) {
      const data = JSON.parse(cachedResponse);
      createCustomMetric('cache.hit', 1);
      return res.json(data);
    }

    createCustomMetric('cache.miss', 1);

    // Store original send
    const originalSend = res.send;
    res.send = function (body: any): Response {
      redis
        .setex(cacheKey, CACHE_TTL, body)
        .catch((err) => logger.error('Cache set error:', err));
      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('Cache middleware error:', error);
    next();
  }
};

// Rate limiting middleware
export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = `ratelimit:${req.ip}`;

  try {
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (requests > RATE_LIMIT_MAX) {
      createCustomMetric('ratelimit.exceeded', 1);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: await redis.ttl(key),
      });
    }

    next();
  } catch (error) {
    logger.error('Rate limit middleware error:', error);
    next();
  }
};

// Query optimization middleware
export const queryOptimizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Limit pagination
  const limit = Math.min(
    parseInt(req.query.limit as string) || QUERY_OPTIMIZATION.defaultLimit,
    QUERY_OPTIMIZATION.maxLimit
  );
  req.query.limit = limit.toString();

  // Optimize fields selection
  if (req.query.fields) {
    const fields = (req.query.fields as string).split(',');
    req.query.fields = fields.slice(0, QUERY_OPTIMIZATION.maxDepth).join(',');
  }

  // Optimize sorting
  if (req.query.sort) {
    const sortFields = (req.query.sort as string).split(',');
    req.query.sort = sortFields.slice(0, 2).join(','); // Limit to 2 sort fields
  }

  next();
};

// Response optimization middleware
export const responseOptimizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Enable compression for large responses
  if (parseInt(res.get('Content-Length') || '0') > COMPRESSION_THRESHOLD) {
    res.setHeader('Content-Encoding', 'gzip');
  }

  // Remove unnecessary headers
  res.removeHeader('X-Powered-By');

  // Add cache control headers for static content
  if (req.path.startsWith('/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  }

  next();
};

// Performance monitoring middleware
export const performanceMonitoringMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    createCustomMetric('request.duration', duration, {
      path: req.path,
      method: req.method,
      status: res.statusCode.toString(),
    });

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected:', {
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

// Memory leak detection
export const memoryLeakDetection = () => {
  const MEMORY_CHECK_INTERVAL = 60000; // 1 minute
  const MEMORY_GROWTH_THRESHOLD = 100 * 1024 * 1024; // 100MB

  let lastMemoryUsage = process.memoryUsage().heapUsed;

  setInterval(() => {
    const currentMemoryUsage = process.memoryUsage().heapUsed;
    const memoryGrowth = currentMemoryUsage - lastMemoryUsage;

    if (memoryGrowth > MEMORY_GROWTH_THRESHOLD) {
      logger.error('Potential memory leak detected:', {
        growth: memoryGrowth / (1024 * 1024) + 'MB',
        total: currentMemoryUsage / (1024 * 1024) + 'MB',
      });

      createCustomMetric('memory.leak.detected', 1);
    }

    lastMemoryUsage = currentMemoryUsage;
  }, MEMORY_CHECK_INTERVAL);
};
