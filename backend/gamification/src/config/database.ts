import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'superapp',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/models/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
});

export const connectDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
}; 