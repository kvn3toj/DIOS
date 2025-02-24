import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logger instance
export const createLogger = (service: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
      timestamp(),
      colorize(),
      logFormat
    ),
    defaultMeta: { service },
    transports: [
      // Console transport
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp(),
          logFormat
        )
      }),
      // File transport for errors
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: combine(
          timestamp(),
          logFormat
        )
      }),
      // File transport for all logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: combine(
          timestamp(),
          logFormat
        )
      })
    ]
  });
};

// Export default logger instance
export const logger = createLogger('gamification-service'); 