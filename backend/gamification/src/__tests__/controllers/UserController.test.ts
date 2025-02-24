import { Request, Response, NextFunction } from 'express';
import { UserController } from '../../controllers/UserController';
import { UserService } from '../../services/UserService';
import { User } from '../../models/User';
import { APIError } from '../../middleware/errorHandler';

// Mock UserService
jest.mock('../../services/UserService');

describe('UserController', () => {
  let controller: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockUser: Partial<User>;

  beforeEach(() => {
    controller = new UserController();
    mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      level: 1,
      points: 100,
      experience: 500
    };

    mockRequest = {
      params: { id: mockUser.id },
      query: {},
      body: {},
      path: '/test',
      method: 'GET'
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup UserService mock implementations
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUser.mockResolvedValue(mockUser as User);
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUserProgress.mockResolvedValue({
      achievements: 5,
      quests: 3,
      totalPoints: 100
    });
    (UserService as jest.MockedClass<typeof UserService>).prototype.updateUser.mockResolvedValue(mockUser as User);
    (UserService as jest.MockedClass<typeof UserService>).prototype.addExperience.mockResolvedValue(mockUser as User);
    (UserService as jest.MockedClass<typeof UserService>).prototype.addPoints.mockResolvedValue(mockUser as User);
    (UserService as jest.MockedClass<typeof UserService>).prototype.updateLevel.mockResolvedValue(mockUser as User);
    (UserService as jest.MockedClass<typeof UserService>).prototype.updateUserStats.mockResolvedValue(mockUser as User);
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUserStats.mockResolvedValue({
      gamesPlayed: 10,
      achievements: 5,
      quests: 3
    });
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUserAchievements.mockResolvedValue([]);
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUserQuests.mockResolvedValue([]);
    (UserService as jest.MockedClass<typeof UserService>).prototype.getUserRewards.mockResolvedValue([]);
    (UserService as jest.MockedClass<typeof UserService>).prototype.searchUsers.mockResolvedValue({
      items: [mockUser],
      total: 1,
      page: 1,
      limit: 10
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      await controller.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.getUser).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should handle user not found', async () => {
      (UserService.prototype.getUser as jest.Mock).mockRejectedValue(
        new APIError(404, 'User not found')
      );

      await controller.getUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getUserProgress', () => {
    it('should get user progress successfully', async () => {
      await controller.getUserProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.getUserProgress).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          achievements: expect.any(Number),
          quests: expect.any(Number),
          totalPoints: expect.any(Number)
        })
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updates = { username: 'newusername' };
      mockRequest.body = updates;

      await controller.updateUser(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.updateUser).toHaveBeenCalledWith(mockUser.id, updates);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'User updated successfully'
      });
    });
  });

  describe('addExperience', () => {
    it('should add experience successfully', async () => {
      mockRequest.body = { amount: 100 };

      await controller.addExperience(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.addExperience).toHaveBeenCalledWith(mockUser.id, 100);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'Experience added successfully'
      });
    });

    it('should validate amount parameter', async () => {
      mockRequest.body = { amount: 'invalid' };

      await controller.addExperience(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('addPoints', () => {
    it('should add points successfully', async () => {
      mockRequest.body = { amount: 50 };

      await controller.addPoints(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.addPoints).toHaveBeenCalledWith(mockUser.id, 50);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'Points added successfully'
      });
    });
  });

  describe('updateLevel', () => {
    it('should update level successfully', async () => {
      mockRequest.body = { level: 2 };

      await controller.updateLevel(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.updateLevel).toHaveBeenCalledWith(mockUser.id, 2);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'Level updated successfully'
      });
    });
  });

  describe('updateStats', () => {
    it('should update stats successfully', async () => {
      const stats = { gamesPlayed: 1 };
      mockRequest.body = { stats };

      await controller.updateStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.updateUserStats).toHaveBeenCalledWith(mockUser.id, stats);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
        message: 'Stats updated successfully'
      });
    });
  });

  describe('getUserStats', () => {
    it('should get user stats successfully', async () => {
      await controller.getUserStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.getUserStats).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          gamesPlayed: expect.any(Number),
          achievements: expect.any(Number),
          quests: expect.any(Number)
        })
      });
    });
  });

  describe('getUserAchievements', () => {
    it('should get user achievements successfully', async () => {
      await controller.getUserAchievements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.getUserAchievements).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('getUserQuests', () => {
    it('should get user quests successfully', async () => {
      await controller.getUserQuests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.getUserQuests).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('getUserRewards', () => {
    it('should get user rewards successfully', async () => {
      await controller.getUserRewards(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.getUserRewards).toHaveBeenCalledWith(mockUser.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Array)
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      mockRequest.query = { query: 'test', page: '1', limit: '10' };

      await controller.searchUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.searchUsers).toHaveBeenCalledWith(
        'test',
        { page: 1, limit: 10 }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          items: expect.any(Array),
          total: expect.any(Number),
          page: expect.any(Number),
          limit: expect.any(Number)
        })
      });
    });

    it('should use default pagination values', async () => {
      mockRequest.query = { query: 'test' };

      await controller.searchUsers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(UserService.prototype.searchUsers).toHaveBeenCalledWith(
        'test',
        { page: 1, limit: 10 }
      );
    });
  });
}); 