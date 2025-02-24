import { createConnection } from 'typeorm';
import { config } from 'dotenv';
import { MockDataGenerator } from './mock-data-generator';
import { AnalyticsEntity } from '../backend/analytics/src/analytics/entities/analytics.entity';

// Load environment variables
config();

async function seedDatabase() {
  try {
    // Create TypeORM connection
    const connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'superapp',
      entities: [AnalyticsEntity],
      synchronize: true
    });

    console.log('Database connection established');

    // Generate mock data
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
    const analyticsRepository = connection.getRepository(AnalyticsEntity);
    await analyticsRepository.save(mockData.analytics);

    console.log('Database seeded successfully');
    console.log('Records created:');
    Object.entries(mockData).forEach(([key, value]) => {
      console.log(`${key}: ${(value as any[]).length} records`);
    });

    // Close connection
    await connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase().then(() => {
  console.log('Seeding completed');
  process.exit(0);
}); 