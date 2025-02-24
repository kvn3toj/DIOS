import { Request, Response, NextFunction } from 'express';
import { AchievementController } from '../../controllers/AchievementController';
import { AchievementService } from '../../services/AchievementService';
import { Achievement, AchievementType, AchievementRarity } from '../../models/Achievement';
import { APIError } from '../../middleware/errorHandler';

// Mock AchievementService
jest.mock('../../services/AchievementService');

describe('AchievementController', () => {
  let controller: AchievementController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockAchievement: Partial<Achievement>;

  beforeEach(() => {
    controller = new AchievementController();
    mockAchievement = {
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
    };

    mockRequest = {
      params: { id: mockAchievement.id, userId: 'test-user-id' },
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

    // Setup AchievementService mock implementations
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.createAchievement.mockResolvedValue(mockAchievement as Achievement);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievement.mockResolvedValue(mockAchievement as Achievement);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.updateAchievement.mockResolvedValue(mockAchievement as Achievement);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAvailableAchievements.mockResolvedValue([mockAchievement as Achievement]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.updateProgress.mockResolvedValue({
      id: 'test-progress-id',
      userId: 'test-user-id',
      achievementId: mockAchievement.id,
      progress: 50,
      status: 'IN_PROGRESS'
    });
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievementStats.mockResolvedValue({
      total: 10,
      active: 8,
      secret: 2,
      expiringSoon: 1
    });
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievementsByType.mockResolvedValue([mockAchievement as Achievement]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievementsByRarity.mockResolvedValue([mockAchievement as Achievement]);
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.getAchievementProgress.mockResolvedValue({
      id: 'test-progress-id',
      userId: 'test-user-id',
      achievementId: mockAchievement.id,
      progress: 50,
      status: 'IN_PROGRESS'
    });
    (AchievementService as jest.MockedClass<typeof AchievementService>).prototype.searchAchievements.mockResolvedValue({
      items: [mockAchievement],
      total: 1,
      page: 1,
      limit: 10
    });
  });

  describe('createAchievement', () => {
    it('should create achievement successfully', async () => {
      const achievementData = {
        name: 'New Achievement',
        description: 'Test Description',
        type: AchievementType.PROGRESSION,
        rarity: AchievementRarity.COMMON,
        points: 100,
        criteria: { type: 'score', target: 1000 }
      };
      mockRequest.body = achievementData;

      await controller.createAchievement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.createAchievement).toHaveBeenCalledWith(achievementData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAchievement,
        message: 'Achievement created successfully'
      });
    });

    it('should validate required fields', async () => {
      mockRequest.body = { name: 'Test' }; // Missing required fields

      await controller.createAchievement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getAchievement', () => {
    it('should get achievement successfully', async () => {
      await controller.getAchievement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.getAchievement).toHaveBeenCalledWith(mockAchievement.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAchievement
      });
    });

    it('should handle achievement not found', async () => {
      (AchievementService.prototype.getAchievement as jest.Mock).mockRejectedValue(
        new APIError(404, 'Achievement not found')
      );

      await controller.getAchievement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('updateAchievement', () => {
    it('should update achievement successfully', async () => {
      const updates = { name: 'Updated Achievement', points: 200 };
      mockRequest.body = updates;

      await controller.updateAchievement(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.updateAchievement).toHaveBeenCalledWith(
        mockAchievement.id,
        updates
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAchievement,
        message: 'Achievement updated successfully'
      });
    });
  });

  describe('getAvailableAchievements', () => {
    it('should get available achievements successfully', async () => {
      await controller.getAvailableAchievements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.getAvailableAchievements).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockAchievement]
      });
    });
  });

  describe('updateProgress', () => {
    it('should update progress successfully', async () => {
      mockRequest.body = { progress: 50, metadata: { action: 'test' } };

      await controller.updateProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.updateProgress).toHaveBeenCalledWith(
        mockRequest.params.userId,
        mockRequest.params.achievementId,
        50,
        { action: 'test' }
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: 'Progress updated successfully'
      });
    });

    it('should validate progress value', async () => {
      mockRequest.body = { progress: 'invalid' };

      await controller.updateProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getAchievementStats', () => {
    it('should get achievement stats successfully', async () => {
      await controller.getAchievementStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.getAchievementStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          total: expect.any(Number),
          active: expect.any(Number),
          secret: expect.any(Number),
          expiringSoon: expect.any(Number)
        })
      });
    });
  });

  describe('getAchievementsByType', () => {
    it('should get achievements by type successfully', async () => {
      mockRequest.params.type = AchievementType.PROGRESSION;

      await controller.getAchievementsByType(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.getAchievementsByType).toHaveBeenCalledWith(AchievementType.PROGRESSION);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockAchievement]
      });
    });

    it('should validate achievement type', async () => {
      mockRequest.params.type = 'invalid-type';

      await controller.getAchievementsByType(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getAchievementsByRarity', () => {
    it('should get achievements by rarity successfully', async () => {
      mockRequest.params.rarity = AchievementRarity.COMMON;

      await controller.getAchievementsByRarity(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.getAchievementsByRarity).toHaveBeenCalledWith(AchievementRarity.COMMON);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockAchievement]
      });
    });
  });

  describe('getAchievementProgress', () => {
    it('should get achievement progress successfully', async () => {
      await controller.getAchievementProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.getAchievementProgress).toHaveBeenCalledWith(
        mockRequest.params.userId,
        mockRequest.params.achievementId
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object)
      });
    });
  });

  describe('searchAchievements', () => {
    it('should search achievements successfully', async () => {
      mockRequest.query = { query: 'test', page: '1', limit: '10' };

      await controller.searchAchievements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.searchAchievements).toHaveBeenCalledWith(
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

      await controller.searchAchievements(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AchievementService.prototype.searchAchievements).toHaveBeenCalledWith(
        'test',
        { page: 1, limit: 10 }
      );
    });
  });
}); 