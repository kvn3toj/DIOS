import { Request, Response, NextFunction } from 'express';
import { QuestController } from '../../controllers/QuestController';
import { QuestService } from '../../services/QuestService';
import { Quest, QuestType, QuestDifficulty } from '../../models/Quest';
import { QuestProgressStatus } from '../../models/QuestProgress';
import { APIError } from '../../middleware/errorHandler';

// Mock QuestService
jest.mock('../../services/QuestService');

describe('QuestController', () => {
  let controller: QuestController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockQuest: Partial<Quest>;

  beforeEach(() => {
    controller = new QuestController();
    mockQuest = {
      id: 'test-quest-id',
      name: 'Test Quest',
      description: 'Test Description',
      type: QuestType.DAILY,
      difficulty: QuestDifficulty.EASY,
      experienceReward: 100,
      pointsReward: 50,
      objectives: [
        { type: 'score', target: 1000, description: 'Score 1000 points', order: 1 }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRequest = {
      params: { id: mockQuest.id, userId: 'test-user-id' },
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

    // Setup QuestService mock implementations
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.createQuest.mockResolvedValue(mockQuest as Quest);
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.getQuest.mockResolvedValue(mockQuest as Quest);
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.updateQuest.mockResolvedValue(mockQuest as Quest);
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.getAvailableQuests.mockResolvedValue([mockQuest as Quest]);
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.startQuest.mockResolvedValue({
      id: 'test-progress-id',
      userId: 'test-user-id',
      questId: mockQuest.id,
      status: QuestProgressStatus.IN_PROGRESS,
      objectiveProgress: [{ index: 0, progress: 0, completed: false }],
      startedAt: new Date()
    });
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.updateObjectiveProgress.mockResolvedValue({
      id: 'test-progress-id',
      userId: 'test-user-id',
      questId: mockQuest.id,
      status: QuestProgressStatus.IN_PROGRESS,
      objectiveProgress: [{ index: 0, progress: 50, completed: false }]
    });
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.getQuestProgress.mockResolvedValue({
      id: 'test-progress-id',
      userId: 'test-user-id',
      questId: mockQuest.id,
      status: QuestProgressStatus.IN_PROGRESS,
      objectiveProgress: [{ index: 0, progress: 50, completed: false }]
    });
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.getQuestStats.mockResolvedValue({
      total: 10,
      active: 8,
      daily: 3,
      weekly: 2,
      expiringSoon: 1
    });
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.getQuestsByType.mockResolvedValue([mockQuest as Quest]);
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.getQuestsByDifficulty.mockResolvedValue([mockQuest as Quest]);
    (QuestService as jest.MockedClass<typeof QuestService>).prototype.searchQuests.mockResolvedValue({
      items: [mockQuest],
      total: 1,
      page: 1,
      limit: 10
    });
  });

  describe('createQuest', () => {
    it('should create quest successfully', async () => {
      const questData = {
        name: 'New Quest',
        description: 'Test Description',
        type: QuestType.DAILY,
        difficulty: QuestDifficulty.EASY,
        experienceReward: 100,
        pointsReward: 50,
        objectives: [
          { type: 'score', target: 1000, description: 'Score 1000 points', order: 1 }
        ]
      };
      mockRequest.body = questData;

      await controller.createQuest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.createQuest).toHaveBeenCalledWith(questData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuest,
        message: 'Quest created successfully'
      });
    });

    it('should validate required fields', async () => {
      mockRequest.body = { name: 'Test' }; // Missing required fields

      await controller.createQuest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getQuest', () => {
    it('should get quest successfully', async () => {
      await controller.getQuest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.getQuest).toHaveBeenCalledWith(mockQuest.id);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuest
      });
    });

    it('should handle quest not found', async () => {
      (QuestService.prototype.getQuest as jest.Mock).mockRejectedValue(
        new APIError(404, 'Quest not found')
      );

      await controller.getQuest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('updateQuest', () => {
    it('should update quest successfully', async () => {
      const updates = {
        name: 'Updated Quest',
        experienceReward: 200,
        pointsReward: 100
      };
      mockRequest.body = updates;

      await controller.updateQuest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.updateQuest).toHaveBeenCalledWith(
        mockQuest.id,
        updates
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuest,
        message: 'Quest updated successfully'
      });
    });
  });

  describe('getAvailableQuests', () => {
    it('should get available quests successfully', async () => {
      await controller.getAvailableQuests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.getAvailableQuests).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockQuest]
      });
    });
  });

  describe('startQuest', () => {
    it('should start quest successfully', async () => {
      await controller.startQuest(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.startQuest).toHaveBeenCalledWith(
        mockRequest.params.userId,
        mockRequest.params.questId
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: 'Quest started successfully'
      });
    });
  });

  describe('updateObjectiveProgress', () => {
    it('should update objective progress successfully', async () => {
      mockRequest.body = { objectiveIndex: 0, value: 50 };

      await controller.updateObjectiveProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.updateObjectiveProgress).toHaveBeenCalledWith(
        mockRequest.params.userId,
        mockRequest.params.questId,
        0,
        50
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: 'Objective progress updated successfully'
      });
    });

    it('should validate progress parameters', async () => {
      mockRequest.body = { objectiveIndex: 'invalid', value: 'invalid' };

      await controller.updateObjectiveProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getQuestProgress', () => {
    it('should get quest progress successfully', async () => {
      await controller.getQuestProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.getQuestProgress).toHaveBeenCalledWith(
        mockRequest.params.userId,
        mockRequest.params.questId
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object)
      });
    });
  });

  describe('getQuestStats', () => {
    it('should get quest stats successfully', async () => {
      await controller.getQuestStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.getQuestStats).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          total: expect.any(Number),
          active: expect.any(Number),
          daily: expect.any(Number),
          weekly: expect.any(Number),
          expiringSoon: expect.any(Number)
        })
      });
    });
  });

  describe('getQuestsByType', () => {
    it('should get quests by type successfully', async () => {
      mockRequest.params.type = QuestType.DAILY;

      await controller.getQuestsByType(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.getQuestsByType).toHaveBeenCalledWith(QuestType.DAILY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockQuest]
      });
    });

    it('should validate quest type', async () => {
      mockRequest.params.type = 'invalid-type';

      await controller.getQuestsByType(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getQuestsByDifficulty', () => {
    it('should get quests by difficulty successfully', async () => {
      mockRequest.params.difficulty = QuestDifficulty.EASY;

      await controller.getQuestsByDifficulty(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.getQuestsByDifficulty).toHaveBeenCalledWith(QuestDifficulty.EASY);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockQuest]
      });
    });
  });

  describe('searchQuests', () => {
    it('should search quests successfully', async () => {
      mockRequest.query = { query: 'test', page: '1', limit: '10' };

      await controller.searchQuests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.searchQuests).toHaveBeenCalledWith(
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

      await controller.searchQuests(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(QuestService.prototype.searchQuests).toHaveBeenCalledWith(
        'test',
        { page: 1, limit: 10 }
      );
    });
  });
}); 