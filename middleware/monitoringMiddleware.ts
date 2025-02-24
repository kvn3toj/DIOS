import { Request, Response, NextFunction } from 'express';
import {
  trackRequest,
  trackError,
  trackResponseTime,
  createCustomMetric
} from '../config/monitoring';

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Track request
  trackRequest();

  // Track response time on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    trackResponseTime(duration);

    // Track status code metrics
    createCustomMetric(`statusCode.${res.statusCode}`, 1);

    // Track endpoint metrics
    createCustomMetric(`endpoint.${req.method}.${req.route?.path || 'unknown'}`, duration, {
      method: req.method,
      path: req.route?.path || 'unknown',
      statusCode: res.statusCode.toString()
    });
  });

  // Track errors
  res.on('error', (error: Error) => {
    trackError(error);
  });

  next();
};

// Resource monitoring
export const resourceMonitoring = () => {
  setInterval(() => {
    const usage = process.memoryUsage();
    
    // Memory metrics
    createCustomMetric('memory.heapUsed', usage.heapUsed);
    createCustomMetric('memory.heapTotal', usage.heapTotal);
    createCustomMetric('memory.external', usage.external);
    createCustomMetric('memory.rss', usage.rss);

    // CPU metrics
    const cpuUsage = process.cpuUsage();
    createCustomMetric('cpu.user', cpuUsage.user);
    createCustomMetric('cpu.system', cpuUsage.system);
  }, 60000); // Every minute
};

// Performance monitoring
export const performanceMonitoring = () => {
  const { performance } = require('perf_hooks');

  // Track event loop lag
  let lastCheck = performance.now();
  setInterval(() => {
    const now = performance.now();
    const lag = now - lastCheck - 1000;
    createCustomMetric('eventLoop.lag', lag);
    lastCheck = now;
  }, 1000);

  // Track GC metrics if available
  if (global.gc) {
    const gc = (global as any).gc;
    performance.timerify(gc);
    performance.addEventListener('gc', ({ kind, duration }: any) => {
      createCustomMetric(`gc.${kind}`, duration);
    });
  }
}; 