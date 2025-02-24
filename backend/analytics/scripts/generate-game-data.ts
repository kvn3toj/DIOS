import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL' | 'MILESTONE';
  criteria: {
    type: string;
    threshold: number;
    conditions: string[];
  };
  reward: {
    type: string;
    value: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'DAILY' | 'WEEKLY' | 'SPECIAL' | 'CHAIN';
  requirements: {
    achievements: string[];
    level: number;
    items: string[];
  };
  reward: {
    type: string;
    value: number;
  };
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

class GameDataGenerator {
  generateAchievements(count: number): Achievement[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      points: faker.number.int({ min: 10, max: 1000 }),
      type: faker.helpers.arrayElement(['DAILY', 'WEEKLY', 'SPECIAL', 'MILESTONE']),
      criteria: {
        type: faker.helpers.arrayElement(['SCORE', 'TIME', 'COLLECTION', 'SOCIAL']),
        threshold: faker.number.int({ min: 1, max: 100 }),
        conditions: faker.helpers.arrayElements(['LOGIN', 'SHARE', 'COMPLETE', 'WIN'], 2)
      },
      reward: {
        type: faker.helpers.arrayElement(['POINTS', 'BADGE', 'ITEM', 'CURRENCY']),
        value: faker.number.int({ min: 100, max: 10000 })
      },
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));
  }

  generateQuests(count: number, achievements: Achievement[]): Quest[] {
    return Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      title: faker.lorem.words(4),
      description: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(['DAILY', 'WEEKLY', 'SPECIAL', 'CHAIN']),
      requirements: {
        achievements: faker.helpers.arrayElements(
          achievements.map(a => a.id),
          faker.number.int({ min: 1, max: 3 })
        ),
        level: faker.number.int({ min: 1, max: 50 }),
        items: faker.helpers.arrayElements(['SWORD', 'SHIELD', 'POTION', 'MAP'], 2)
      },
      reward: {
        type: faker.helpers.arrayElement(['POINTS', 'BADGE', 'ITEM', 'CURRENCY']),
        value: faker.number.int({ min: 1000, max: 50000 })
      },
      deadline: faker.date.future(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));
  }
}

async function generateAndSaveGameData() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'superapp',
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const generator = new GameDataGenerator();
    
    // Generate achievements first
    const achievements = generator.generateAchievements(100);
    console.log(`Generated ${achievements.length} achievements`);

    // Generate quests using the generated achievements
    const quests = generator.generateQuests(50, achievements);
    console.log(`Generated ${quests.length} quests`);

    // Save achievements
    for (const achievement of achievements) {
      await dataSource.query(
        `INSERT INTO achievements (id, title, description, points, type, criteria, reward, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          achievement.id,
          achievement.title,
          achievement.description,
          achievement.points,
          achievement.type,
          JSON.stringify(achievement.criteria),
          JSON.stringify(achievement.reward),
          achievement.createdAt,
          achievement.updatedAt
        ]
      );
    }
    console.log('Saved achievements');

    // Save quests
    for (const quest of quests) {
      await dataSource.query(
        `INSERT INTO quests (id, title, description, type, requirements, reward, deadline, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          quest.id,
          quest.title,
          quest.description,
          quest.type,
          JSON.stringify(quest.requirements),
          JSON.stringify(quest.reward),
          quest.deadline,
          quest.createdAt,
          quest.updatedAt
        ]
      );
    }
    console.log('Saved quests');

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error generating game data:', error);
    process.exit(1);
  }
}

generateAndSaveGameData(); 