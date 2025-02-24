export * from './authMiddleware';
export * from './errorHandler';
export * from './validationMiddleware';
export * from './loggingMiddleware';

// Middleware application order
export const applyMiddleware = (app: any): void => {
  const {
    json,
    urlencoded
  } = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const compression = require('compression');
  const { requestLogger, errorLogger, performanceLogger } = require('./loggingMiddleware');
  const { errorHandler } = require('./errorHandler');

  // Basic middleware
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(cors());
  app.use(helmet());
  app.use(compression());

  // Logging middleware
  app.use(requestLogger);
  app.use(performanceLogger);

  // Error handling middleware (should be last)
  app.use(errorLogger);
  app.use(errorHandler);
}; 