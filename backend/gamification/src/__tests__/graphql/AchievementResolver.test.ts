import { ApolloServer } from 'apollo-server-express';
import { schema } from '../../graphql/schema';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { AchievementProgress, ProgressStatus } from '../../models/AchievementProgress';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';
import { AchievementService } from '../../services/AchievementService';
import { UserService } from '../../services/UserService';

// Mock services
jest.mock('../../services/AchievementService');
jest.mock('../../services/UserService');

describe('Achievement GraphQL Resolver', () => {
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
      points: 0
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
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievement
      .mockResolvedValue(testAchievement);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getProgress
      .mockResolvedValue(testProgress);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievements
      .mockResolvedValue([testAchievement]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getUserAchievements
      .mockResolvedValue([testAchievement]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.createAchievement
      .mockResolvedValue(testAchievement);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.updateAchievement
      .mockResolvedValue(testAchievement);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.deleteAchievement
      .mockResolvedValue(true);
  });

  describe('Queries', () => {
    it('should get achievement by id', async () => {
      const query = `
        query GetAchievement($id: ID!) {
          achievement(id: $id) {
            id
            name
            description
            points
            criteria
            category
            createdAt
            updatedAt
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testAchievement.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.achievement).toEqual(expect.objectContaining({
        id: testAchievement.id,
        name: testAchievement.name,
        description: testAchievement.description,
        points: testAchievement.points
      }));
    });

    it('should get achievements with filters', async () => {
      const query = `
        query GetAchievements($category: String, $offset: Int, $limit: Int) {
          achievements(category: $category, offset: $offset, limit: $limit) {
            id
            name
            description
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { category: 'TEST', offset: 0, limit: 10 }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.achievements).toHaveLength(1);
      expect(response.data?.achievements[0]).toEqual(expect.objectContaining({
        id: testAchievement.id,
        name: testAchievement.name
      }));
    });

    it('should get user achievements', async () => {
      const query = `
        query GetUserAchievements($userId: ID!, $completed: Boolean, $offset: Int, $limit: Int) {
          userAchievements(userId: $userId, completed: $completed, offset: $offset, limit: $limit) {
            id
            userId
            achievementId
            currentValue
            completed
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { userId: testUser.id, completed: false, offset: 0, limit: 10 }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.userAchievements).toBeDefined();
    });
  });

  describe('Mutations', () => {
    it('should create achievement', async () => {
      const mutation = `
        mutation CreateAchievement($name: String!, $description: String!, $points: Int!, $criteria: String!, $category: String!, $icon: String) {
          createAchievement(
            name: $name
            description: $description
            points: $points
            criteria: $criteria
            category: $category
            icon: $icon
          ) {
            id
            name
            description
            points
          }
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          name: 'New Achievement',
          description: 'Test Description',
          points: 100,
          criteria: JSON.stringify({ type: 'score', target: 1000 }),
          category: 'TEST'
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.createAchievement).toEqual(expect.objectContaining({
        name: 'New Achievement',
        description: 'Test Description',
        points: 100
      }));
    });

    it('should update achievement', async () => {
      const mutation = `
        mutation UpdateAchievement($id: ID!, $name: String, $description: String, $points: Int) {
          updateAchievement(
            id: $id
            name: $name
            description: $description
            points: $points
          ) {
            id
            name
            description
            points
          }
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: {
          id: testAchievement.id,
          name: 'Updated Achievement',
          points: 200
        }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.updateAchievement).toBeDefined();
      expect(AchievementService.prototype.updateAchievement)
        .toHaveBeenCalledWith(testAchievement.id, expect.objectContaining({
          name: 'Updated Achievement',
          points: 200
        }));
    });

    it('should delete achievement', async () => {
      const mutation = `
        mutation DeleteAchievement($id: ID!) {
          deleteAchievement(id: $id)
        }
      `;

      const response = await server.executeOperation({
        query: mutation,
        variables: { id: testAchievement.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.deleteAchievement).toBe(true);
      expect(AchievementService.prototype.deleteAchievement)
        .toHaveBeenCalledWith(testAchievement.id);
    });
  });

  describe('Field Resolvers', () => {
    it('should resolve achievement progress for user', async () => {
      const query = `
        query GetAchievementProgress($id: ID!, $userId: ID!) {
          achievement(id: $id) {
            id
            name
            progress(userId: $userId) {
              id
              userId
              currentValue
              completed
            }
          }
        }
      `;

      const response = await server.executeOperation({
        query,
        variables: { id: testAchievement.id, userId: testUser.id }
      });

      expect(response.errors).toBeUndefined();
      expect(response.data?.achievement.progress).toEqual(expect.objectContaining({
        id: testProgress.id,
        userId: testUser.id
      }));
    });
  });
}); 