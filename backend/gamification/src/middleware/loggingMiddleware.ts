import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ResponseWithBody extends Response {
  body?: any;
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request:', {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : undefined
    },
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Intercept response body
  const originalSend = res.send;
  (res as ResponseWithBody).send = function (body) {
    (res as ResponseWithBody).body = body;
    return originalSend.call(this, body);
  };

  // Log response when request is complete
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseBody = (res as ResponseWithBody).body;

    logger.info('Response sent:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: res.get('Content-Length'),
      body: responseBody ? JSON.parse(responseBody) : undefined,
      timestamp: new Date().toISOString()
    });

    // Log performance metrics if duration is high
    if (duration > 1000) {
      logger.warn('Slow request detected:', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

export const errorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Request error:', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
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
      },
      ip: req.ip
    },
    timestamp: new Date().toISOString()
  });

  next(error);
};

export const performanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log detailed performance metrics
    logger.debug('Performance metrics:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });

    // Track performance in analytics if duration is significant
    if (duration > 1000) {
      // You could integrate with your analytics service here
      // analyticsService.trackPerformanceMetric({
      //   path: req.path,
      //   duration,
      //   timestamp: new Date()
      // });
    }
  });

  next();
}; 