import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { AnalyticsEntity } from '../src/analytics/entities/analytics.entity';
import { DatabaseMetric } from '../src/monitoring/entities/database-metric.entity';
import { MockDataGenerator } from './mock-data-generator';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'superapp',
  entities: [AnalyticsEntity, DatabaseMetric],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

async function saveMockData() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const mockDataConfig = {
      users: 50,
      achievements: 100,
      quests: 50,
      activities: 200,
      analytics: 1000
    };

    const generator = new MockDataGenerator(mockDataConfig);
    const mockData = await generator.generate();

    // Save analytics data
    const analyticsRepository = dataSource.getRepository(AnalyticsEntity);
    await analyticsRepository.save(mockData.analytics);
    console.log(`Saved ${mockData.analytics.length} analytics records`);

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error saving mock data:', error);
    process.exit(1);
  }
}

saveMockData(); 