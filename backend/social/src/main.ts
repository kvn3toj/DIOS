import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create Winston logger
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ],
  });

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Start the server
  const port = configService.get('port', 3001);
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Metrics: http://localhost:${port}/metrics`);
}

bootstrap(); 