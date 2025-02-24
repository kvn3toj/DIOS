import { ApolloServer } from 'apollo-server-express';
import { schema } from '../../graphql/schema';
import { User } from '../../models/User';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { AchievementProgress, ProgressStatus } from '../../models/AchievementProgress';
import { AppDataSource } from '../../config/database';
import { UserService } from '../../services/UserService';
import { AchievementService } from '../../services/AchievementService';

// Mock services
jest.mock('../../services/UserService');
jest.mock('../../services/AchievementService');

describe('User GraphQL Resolver', () => {
  let server: ApolloServer;
  let testUser: User;
  let testAchievement: Achievement;
  let testProgress: AchievementProgress;

  beforeAll(async () => {
    // Initialize Apollo Server
    server = new ApolloServer({
      schema,
      context: () => ({
        user: testUser,
        dataSources: {
          userService: new UserService(),
          achievementService: new AchievementService()
        }
      })
    });
  });

  beforeEach(async () => {
    // Create test data
    testUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      level: 1,
      experience: 0,
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    testAchievement = {
      id: 'test-achievement-id',
      name: 'Test Achievement',
      description: 'Test Description',
      type: AchievementType.PROGRESSION,
      rarity: AchievementRarity.COMMON,
      points: 100,
      criteria: { type: 'score', target: 1000 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Achievement;

    testProgress = {
      id: 'test-progress-id',
      userId: testUser.id,
      achievementId: testAchievement.id,
      progress: 50,
      status: ProgressStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date()
    } as AchievementProgress;

    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUser
      .mockResolvedValue(testUser);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getUserAchievements
      .mockResolvedValue([testAchievement]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getUserProgress
      .mockResolvedValue([testProgress]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getUserTotalPoints
      .mockResolvedValue(100);
  });

  describe('Field Resolvers', () => {
    it('should resolve user achievements', async () => {
      const query = `
        query GetUserWithAchievements($id: ID!) {
          user(id: $id) {
            id
            username
            achievements {
              id
              name
              description
              points
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testUser.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.user.achievements).toHaveLength(1);
      expect(response.data?.user.achievements[0]).toEqual(expect.objectContaining({
        id: testAchievement.id,
        name: testAchievement.name,
        points: testAchievement.points
      }));
    });

    it('should resolve user progress', async () => {
      const query = `
        query GetUserWithProgress($id: ID!) {
          user(id: $id) {
            id
            username
            progress {
              id
              achievementId
              currentValue
              completed
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testUser.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.user.progress).toHaveLength(1);
      expect(response.data?.user.progress[0]).toEqual(expect.objectContaining({
        id: testProgress.id,
        achievementId: testProgress.achievementId
      }));
    });

    it('should resolve user total points', async () => {
      const query = `
        query GetUserWithPoints($id: ID!) {
          user(id: $id) {
            id
            username
            totalPoints
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testUser.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.user.totalPoints).toBe(100);
      expect(AchievementService.prototype.getUserTotalPoints)
        .toHaveBeenCalledWith(testUser.id);
    });
  });

  describe('Reference Resolution', () => {
    it('should resolve user reference', async () => {
      const query = `
        query GetUserReference($id: ID!) {
          _entities(representations: [{ __typename: "User", id: $id }]) {
            ... on User {
              id
              username
              email
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testUser.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?._entities[0]).toEqual(expect.objectContaining({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email
      }));
    });
  });

  describe('Leaderboard Query', () => {
    beforeEach(() => {
      (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getLeaderboard
        .mockResolvedValue([
          { ...testUser, points: 100 },
          { ...testUser, id: 'user-2', username: 'user2', points: 80 },
          { ...testUser, id: 'user-3', username: 'user3', points: 60 }
        ]);
    });

    it('should get leaderboard', async () => {
      const query = `
        query GetLeaderboard($timeframe: String, $category: String, $limit: Int) {
          leaderboard(timeframe: $timeframe, category: $category, limit: $limit) {
            id
            username
            points
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: {
          timeframe: 'weekly',
          category: 'all',
          limit: 3
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.leaderboard).toHaveLength(3);
      expect(response.data?.leaderboard[0]).toEqual(expect.objectContaining({
        id: testUser.id,
        username: testUser.username,
        points: 100
      }));
      expect(AchievementService.prototype.getLeaderboard)
        .toHaveBeenCalledWith({
          timeframe: 'weekly',
          category: 'all',
          limit: 3
        });
    });
  });
}); 