import { RewardRepository } from '../../repositories/RewardRepository';
import { Reward, RewardType, RewardStatus } from '../../models/Reward';
import { User } from '../../models/User';
import { AppDataSource } from '../../config/database';

describe('RewardRepository', () => {
  let repository: RewardRepository;
  let testUser: User;
  let testReward: Reward;

  beforeEach(async () => {
    repository = new RewardRepository();
    testUser = await global.createTestUser();
    testReward = await repository.create({
      userId: testUser.id,
      name: 'Test Reward',
      type: RewardType.POINTS,
      value: { amount: 100 },
      status: RewardStatus.AVAILABLE
    });
  });

  describe('create', () => {
    it('should create a new reward', async () => {
      const data = {
        userId: testUser.id,
        name: 'Achievement Points',
        description: 'Points earned from achievement',
        type: RewardType.POINTS,
        value: {
          amount: 500,
          metadata: { achievementId: 'test-id' }
        },
        icon: 'points-icon.png',
        source: {
          type: 'ACHIEVEMENT',
          id: 'test-id'
        }
      };

      const reward = await repository.create(data);

      expect(reward).toBeDefined();
      expect(reward.id).toBeDefined();
      expect(reward.userId).toBe(data.userId);
      expect(reward.name).toBe(data.name);
      expect(reward.type).toBe(data.type);
      expect(reward.value).toEqual(data.value);
      expect(reward.status).toBe(RewardStatus.AVAILABLE);
      expect(reward.icon).toBe(data.icon);
      expect(reward.source).toEqual(data.source);
      expect(reward.createdAt).toBeDefined();
      expect(reward.updatedAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find reward by id', async () => {
      const reward = await repository.findById(testReward.id);

      expect(reward).toBeDefined();
      expect(reward?.id).toBe(testReward.id);
    });

    it('should return null for non-existent id', async () => {
      const reward = await repository.findById('non-existent-id');

      expect(reward).toBeNull();
    });
  });

  describe('findByUser', () => {
    beforeEach(async () => {
      // Create additional rewards
      await repository.create({
        userId: testUser.id,
        name: 'Quest Reward',
        type: RewardType.EXPERIENCE,
        value: { amount: 1000 },
        status: RewardStatus.AVAILABLE,
        source: { type: 'QUEST', id: 'test-quest' }
      });

      await repository.create({
        userId: testUser.id,
        name: 'Claimed Reward',
        type: RewardType.BADGE,
        value: { itemId: 'test-badge' },
        status: RewardStatus.CLAIMED,
        claimedAt: new Date(),
        source: { type: 'ACHIEVEMENT', id: 'test-achievement' }
      });
    });

    it('should find all rewards for user', async () => {
      const rewards = await repository.findByUser(testUser.id);

      expect(rewards.length).toBe(3);
      rewards.forEach(r => {
        expect(r.userId).toBe(testUser.id);
      });
    });

    it('should find rewards with relations', async () => {
      const rewards = await repository.findByUser(testUser.id, ['user']);

      expect(rewards.length).toBeGreaterThan(0);
      rewards.forEach(r => {
        expect(r.user).toBeDefined();
        expect(r.user.id).toBe(r.userId);
      });
    });
  });

  describe('findAvailableByUser', () => {
    beforeEach(async () => {
      // Create rewards with different statuses and expiry
      await repository.create({
        userId: testUser.id,
        name: 'Available Reward',
        type: RewardType.CURRENCY,
        value: { amount: 100 },
        status: RewardStatus.AVAILABLE
      });

      await repository.create({
        userId: testUser.id,
        name: 'Expiring Reward',
        type: RewardType.ITEM,
        value: { itemId: 'test-item' },
        status: RewardStatus.AVAILABLE,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day from now
      });
    });

    it('should find available rewards', async () => {
      const rewards = await repository.findAvailableByUser(testUser.id);

      expect(rewards.length).toBeGreaterThan(0);
      rewards.forEach(r => {
        expect(r.userId).toBe(testUser.id);
        expect(r.status).toBe(RewardStatus.AVAILABLE);
        if (r.expiresAt) {
          expect(r.expiresAt.getTime()).toBeGreaterThan(Date.now());
        }
      });
    });
  });

  describe('findByType', () => {
    it('should find rewards by type', async () => {
      const rewards = await repository.findByType(testUser.id, RewardType.POINTS);

      expect(rewards.length).toBeGreaterThan(0);
      rewards.forEach(r => {
        expect(r.userId).toBe(testUser.id);
        expect(r.type).toBe(RewardType.POINTS);
      });
    });
  });

  describe('findExpired', () => {
    beforeEach(async () => {
      // Create expired reward
      await repository.create({
        userId: testUser.id,
        name: 'Expired Reward',
        type: RewardType.ITEM,
        value: { itemId: 'test-item' },
        status: RewardStatus.AVAILABLE,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
    });

    it('should find expired rewards', async () => {
      const expired = await repository.findExpired();

      expect(expired.length).toBeGreaterThan(0);
      expired.forEach(r => {
        expect(r.expiresAt).toBeDefined();
        expect(r.expiresAt!.getTime()).toBeLessThan(Date.now());
      });
    });
  });

  describe('claimReward', () => {
    it('should claim reward', async () => {
      const reward = await repository.claimReward(testReward.id);

      expect(reward).toBeDefined();
      expect(reward?.status).toBe(RewardStatus.CLAIMED);
      expect(reward?.claimedAt).toBeDefined();
    });

    it('should return null for non-existent id', async () => {
      const reward = await repository.claimReward('non-existent-id');

      expect(reward).toBeNull();
    });
  });

  describe('updateExpiredStatus', () => {
    beforeEach(async () => {
      // Create expired reward
      await repository.create({
        userId: testUser.id,
        name: 'Expired Reward',
        type: RewardType.ITEM,
        value: { itemId: 'test-item' },
        status: RewardStatus.AVAILABLE,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
    });

    it('should update status of expired rewards', async () => {
      await repository.updateExpiredStatus();

      const rewards = await repository.findByUser(testUser.id);
      rewards.forEach(r => {
        if (r.expiresAt && r.expiresAt.getTime() < Date.now()) {
          expect(r.status).toBe(RewardStatus.EXPIRED);
        }
      });
    });
  });

  describe('getRewardStats', () => {
    it('should return reward statistics', async () => {
      const stats = await repository.getRewardStats(testUser.id);

      expect(stats).toEqual(expect.objectContaining({
        total: expect.any(Number),
        available: expect.any(Number),
        claimed: expect.any(Number),
        expired: expect.any(Number)
      }));
    });
  });
}); 