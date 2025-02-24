import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AnalyticsEntity } from '../analytics/entities/analytics.entity';
import { Achievement } from '../entities/Achievement';
import { Quest } from '../entities/Quest';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'superapp',
  entities: [AnalyticsEntity, Achievement, Quest],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
}); 