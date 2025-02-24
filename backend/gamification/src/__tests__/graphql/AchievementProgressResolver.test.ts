import { ApolloServer } from 'apollo-server-express';
import { schema } from '../../graphql/schema';
import { User } from '../../models/User';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { AchievementProgress, ProgressStatus } from '../../models/AchievementProgress';
import { AppDataSource } from '../../config/database';
import { AchievementService } from '../../services/AchievementService';
import { UserService } from '../../services/UserService';

// Mock services
jest.mock('../../services/AchievementService');
jest.mock('../../services/UserService');

describe('AchievementProgress GraphQL Resolver', () => {
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
          achievementService: new AchievementService(),
          userService: new UserService()
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
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getProgressById
      .mockResolvedValue(testProgress);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievement
      .mockResolvedValue(testAchievement);
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUser
      .mockResolvedValue(testUser);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.updateProgress
      .mockResolvedValue(testProgress);
  });

  describe('Field Resolvers', () => {
    it('should resolve achievement field', async () => {
      const query = `
        query GetProgressWithAchievement($id: ID!) {
          achievementProgress(id: $id) {
            id
            userId
            achievementId
            currentValue
            completed
            achievement {
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
        variables: { id: testProgress.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.achievementProgress.achievement).toEqual(expect.objectContaining({
        id: testAchievement.id,
        name: testAchievement.name,
        description: testAchievement.description,
        points: testAchievement.points
      }));
    });

    it('should resolve user field', async () => {
      const query = `
        query GetProgressWithUser($id: ID!) {
          achievementProgress(id: $id) {
            id
            userId
            achievementId
            currentValue
            completed
            user {
              id
              username
              email
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testProgress.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.achievementProgress.user).toEqual(expect.objectContaining({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email
      }));
    });
  });

  describe('Reference Resolution', () => {
    it('should resolve progress reference', async () => {
      const query = `
        query GetProgressReference($id: ID!) {
          _entities(representations: [{ __typename: "AchievementProgress", id: $id }]) {
            ... on AchievementProgress {
              id
              userId
              achievementId
              currentValue
              completed
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testProgress.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?._entities[0]).toEqual(expect.objectContaining({
        id: testProgress.id,
        userId: testProgress.userId,
        achievementId: testProgress.achievementId
      }));
    });
  });

  describe('Mutations', () => {
    it('should update achievement progress', async () => {
      const mutation = `
        mutation UpdateProgress($userId: ID!, $achievementId: ID!, $value: Float!) {
          updateAchievementProgress(
            userId: $userId
            achievementId: $achievementId
            value: $value
          ) {
            id
            userId
            achievementId
            currentValue
            completed
          }
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          userId: testUser.id,
          achievementId: testAchievement.id,
          value: 75.5
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.updateAchievementProgress).toBeDefined();
      expect(AchievementService.prototype.updateProgress)
        .toHaveBeenCalledWith(testUser.id, testAchievement.id, 75.5);
    });

    it('should reset achievement progress', async () => {
      const mutation = `
        mutation ResetProgress($userId: ID!, $achievementId: ID!) {
          resetProgress(
            userId: $userId
            achievementId: $achievementId
          )
        }
      `;

      (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.resetProgress
        .mockResolvedValue(true);

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          userId: testUser.id,
          achievementId: testAchievement.id
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.resetProgress).toBe(true);
      expect(AchievementService.prototype.resetProgress)
        .toHaveBeenCalledWith(testUser.id, testAchievement.id);
    });
  });
}); 