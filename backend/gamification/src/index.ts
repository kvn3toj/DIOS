import 'reflect-metadata';
import { config } from 'dotenv';
import app from './app';
import { logger } from './utils/logger';

// Load environment variables
config();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason,
    promise
  });
  process.exit(1);
});

// Start the application
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
}); 