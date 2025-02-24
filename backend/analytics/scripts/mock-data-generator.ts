import { faker } from '@faker-js/faker';
import { AnalyticsEntity } from '../src/analytics/entities/analytics.entity';
import { AnalyticsType } from '../src/analytics/enums/analytics-type.enum';
import { AnalyticsCategory } from '../src/analytics/enums/analytics-category.enum';

interface MockDataConfig {
  users: number;
  achievements: number;
  quests: number;
  activities: number;
  analytics: number;
}

export class MockDataGenerator {
  private config: MockDataConfig;

  constructor(config: MockDataConfig) {
    this.config = config;
  }

  generateUsers() {
    return Array.from({ length: this.config.users }, () => ({
      id: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));
  }

  generateAchievements(users: any[]) {
    return Array.from({ length: this.config.achievements }, () => ({
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

  generateQuests(users: any[], achievements: any[]) {
    return Array.from({ length: this.config.quests }, () => ({
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

  generateActivities(users: any[]) {
    return Array.from({ length: this.config.activities }, () => {
      const user = faker.helpers.arrayElement(users);
      return {
        id: faker.string.uuid(),
        userId: user.id,
        type: faker.helpers.arrayElement(['POST', 'COMMENT', 'ACHIEVEMENT', 'QUEST']),
        content: faker.lorem.paragraph(),
        metadata: {
          location: faker.location.city(),
          device: faker.helpers.arrayElement(['MOBILE', 'DESKTOP', 'TABLET']),
          platform: faker.helpers.arrayElement(['IOS', 'ANDROID', 'WEB'])
        },
        visibility: faker.helpers.arrayElement(['PUBLIC', 'PRIVATE', 'FRIENDS']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
    });
  }

  generateAnalytics(users: any[], activities: any[]): AnalyticsEntity[] {
    return Array.from({ length: this.config.analytics }, () => {
      const user = faker.helpers.arrayElement(users);
      const activity = faker.helpers.arrayElement(activities);
      const analytic = new AnalyticsEntity();

      analytic.type = faker.helpers.arrayElement(Object.values(AnalyticsType));
      analytic.category = faker.helpers.arrayElement(Object.values(AnalyticsCategory));
      analytic.event = faker.helpers.arrayElement([
        'login',
        'logout',
        'achievement_unlocked',
        'quest_completed',
        'level_up',
        'item_purchased',
        'friend_added',
        'message_sent',
        'game_started',
        'game_ended'
      ]);

      if (faker.datatype.boolean(0.8)) {
        analytic.userId = user.id;
      }

      if (faker.datatype.boolean(0.7)) {
        analytic.sessionId = `session_${faker.number.int({ min: 1, max: 500 })}`;
      }

      if (faker.datatype.boolean(0.6)) {
        analytic.deviceId = `device_${faker.number.int({ min: 1, max: 200 })}`;
      }

      if (faker.datatype.boolean(0.5)) {
        analytic.source = activity.metadata.platform;
      }

      if (faker.datatype.boolean(0.4)) {
        analytic.metadata = {
          platform: activity.metadata.platform,
          version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 10 })}.${faker.number.int({ min: 0, max: 10 })}`,
          environment: faker.helpers.arrayElement(['production', 'staging', 'development'])
        };
      }

      if (faker.datatype.boolean(0.3)) {
        analytic.context = {
          url: faker.internet.url(),
          referrer: faker.internet.url(),
          userAgent: faker.internet.userAgent(),
          ipAddress: faker.internet.ip()
        };
      }

      if (faker.datatype.boolean(0.2)) {
        analytic.customData = {
          score: faker.number.int({ min: 0, max: 1000 }),
          timeSpent: faker.number.int({ min: 0, max: 3600 }),
          level: faker.number.int({ min: 1, max: 50 }),
          achievements: faker.number.int({ min: 0, max: 20 }),
          coins: faker.number.int({ min: 0, max: 10000 })
        };
      }

      return analytic;
    });
  }

  async generate() {
    const users = this.generateUsers();
    const achievements = this.generateAchievements(users);
    const quests = this.generateQuests(users, achievements);
    const activities = this.generateActivities(users);
    const analytics = this.generateAnalytics(users, activities);

    return {
      users,
      achievements,
      quests,
      activities,
      analytics
    };
  }
}

// Example usage for testing the generator
if (require.main === module) {
  const config: MockDataConfig = {
    users: 50,
    achievements: 100,
    quests: 50,
    activities: 200,
    analytics: 1000
  };

  const generator = new MockDataGenerator(config);

  // Generate mock data
  generator.generate().then(mockData => {
    console.log('Mock data generated successfully:');
    Object.entries(mockData).forEach(([key, value]) => {
      console.log(`${key}: ${value.length} records`);
    });
  });
}

function generateMockAnalytics(count: number): AnalyticsEntity[] {
  const analytics: AnalyticsEntity[] = [];
  
  for (let i = 0; i < count; i++) {
    const analytic = new AnalyticsEntity();
    analytic.type = faker.helpers.arrayElement(Object.values(AnalyticsType));
    analytic.category = faker.helpers.arrayElement(Object.values(AnalyticsCategory));
    analytic.event = faker.helpers.arrayElement([
      'login',
      'logout',
      'achievement_unlocked',
      'quest_completed',
      'level_up',
      'item_purchased',
      'friend_added',
      'message_sent',
      'game_started',
      'game_ended'
    ]);
    
    if (faker.datatype.boolean(0.8)) {
      analytic.userId = `user_${faker.number.int({ min: 1, max: 1000 })}`;
    }
    
    if (faker.datatype.boolean(0.7)) {
      analytic.sessionId = `session_${faker.number.int({ min: 1, max: 500 })}`;
    }
    
    if (faker.datatype.boolean(0.6)) {
      analytic.deviceId = `device_${faker.number.int({ min: 1, max: 200 })}`;
    }
    
    if (faker.datatype.boolean(0.5)) {
      analytic.source = faker.helpers.arrayElement(['web', 'mobile_ios', 'mobile_android', 'desktop_app']);
    }
    
    if (faker.datatype.boolean(0.4)) {
      analytic.metadata = {
        platform: faker.helpers.arrayElement(['web', 'mobile_ios', 'mobile_android', 'desktop_app']),
        version: `${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 10 })}.${faker.number.int({ min: 0, max: 10 })}`,
        environment: faker.helpers.arrayElement(['production', 'staging', 'development'])
      };
    }
    
    if (faker.datatype.boolean(0.3)) {
      analytic.context = {
        url: faker.internet.url(),
        referrer: faker.internet.url(),
        userAgent: faker.internet.userAgent(),
        ipAddress: faker.internet.ip()
      };
    }
    
    if (faker.datatype.boolean(0.2)) {
      analytic.customData = {
        score: faker.number.int({ min: 0, max: 1000 }),
        timeSpent: faker.number.int({ min: 0, max: 3600 }),
        level: faker.number.int({ min: 1, max: 50 }),
        achievements: faker.number.int({ min: 0, max: 20 }),
        coins: faker.number.int({ min: 0, max: 10000 })
      };
    }
    
    analytics.push(analytic);
  }
  
  return analytics;
}

// Generate mock data
const mockAnalytics = generateMockAnalytics(100);
console.log('Generated mock analytics:', mockAnalytics); 