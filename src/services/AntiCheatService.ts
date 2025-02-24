import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { createCustomMetric } from '../config/monitoring';
import { UserService } from './UserService';
import { AchievementService } from './AchievementService';
import { QuestService } from './QuestService';

export class AntiCheatService {
  private redis: Redis;
  private userService: UserService;
  private achievementService: AchievementService;
  private questService: QuestService;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.userService = new UserService();
    this.achievementService = new AchievementService();
    this.questService = new QuestService();
  }

  // Rate limiting for actions
  async checkActionRate(userId: string, actionType: string): Promise<boolean> {
    const key = `rate_limit:${userId}:${actionType}`;
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, 60); // 1 minute window
    }

    const limits: { [key: string]: number } = {
      achievement_progress: 10, // 10 achievement updates per minute
      quest_progress: 5, // 5 quest updates per minute
      reward_claim: 3, // 3 reward claims per minute
    };

    if (count > (limits[actionType] || 1)) {
      this.logSuspiciousActivity(userId, 'rate_limit_exceeded', {
        actionType,
        count,
        limit: limits[actionType],
      });
      return false;
    }

    return true;
  }

  // Progress validation
  async validateProgressUpdate(
    userId: string,
    achievementId: string,
    progress: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const key = `progress:${userId}:${achievementId}`;
    const lastProgress = await this.redis.get(key);

    if (lastProgress) {
      const previousProgress = parseFloat(lastProgress);
      const maxAllowedIncrease =
        this.calculateMaxAllowedIncrease(previousProgress);

      if (progress - previousProgress > maxAllowedIncrease) {
        this.logSuspiciousActivity(userId, 'abnormal_progress', {
          achievementId,
          previousProgress,
          newProgress: progress,
          maxAllowedIncrease,
        });
        return false;
      }
    }

    await this.redis.set(key, progress.toString());
    return true;
  }

  // Time-based validation
  async validateTimeBasedAction(
    userId: string,
    actionType: string
  ): Promise<boolean> {
    const key = `last_action:${userId}:${actionType}`;
    const lastActionTime = await this.redis.get(key);

    if (lastActionTime) {
      const minTimeBetweenActions: { [key: string]: number } = {
        quest_completion: 60, // 1 minute between quest completions
        reward_claim: 300, // 5 minutes between reward claims
        achievement_unlock: 30, // 30 seconds between achievement unlocks
      };

      const timeDiff = Date.now() - parseInt(lastActionTime);
      if (timeDiff < (minTimeBetweenActions[actionType] || 0) * 1000) {
        this.logSuspiciousActivity(userId, 'time_based_violation', {
          actionType,
          timeDiff,
          minRequired: minTimeBetweenActions[actionType],
        });
        return false;
      }
    }

    await this.redis.set(key, Date.now().toString());
    return true;
  }

  // Pattern detection
  async detectSuspiciousPatterns(userId: string): Promise<boolean> {
    const key = `user_actions:${userId}`;
    const actions = await this.redis.lrange(key, 0, -1);

    // Check for repetitive patterns
    if (this.hasRepetitivePattern(actions)) {
      this.logSuspiciousActivity(userId, 'repetitive_pattern', {
        actionsCount: actions.length,
        pattern: 'repetitive_actions',
      });
      return true;
    }

    // Check for impossible sequences
    if (this.hasImpossibleSequence(actions)) {
      this.logSuspiciousActivity(userId, 'impossible_sequence', {
        actionsCount: actions.length,
        sequence: 'impossible_action_order',
      });
      return true;
    }

    return false;
  }

  // IP-based validation
  async validateIPAddress(userId: string, ip: string): Promise<boolean> {
    const key = `user_ips:${userId}`;
    const recentIPs = await this.redis.lrange(key, 0, 4); // Last 5 IPs

    await this.redis.lpush(key, ip);
    await this.redis.ltrim(key, 0, 4);

    // Check for rapid IP changes
    if (recentIPs.length >= 3 && !recentIPs.includes(ip)) {
      this.logSuspiciousActivity(userId, 'multiple_ips', {
        currentIp: ip,
        recentIps: recentIPs,
      });
      return false;
    }

    return true;
  }

  // Session validation
  async validateSession(userId: string, sessionId: string): Promise<boolean> {
    const key = `active_sessions:${userId}`;
    const activeSessions = await this.redis.smembers(key);

    // Check for multiple concurrent sessions
    if (activeSessions.length > 3 && !activeSessions.includes(sessionId)) {
      this.logSuspiciousActivity(userId, 'multiple_sessions', {
        sessionId,
        activeSessions,
      });
      return false;
    }

    await this.redis.sadd(key, sessionId);
    return true;
  }

  // Helper methods
  private calculateMaxAllowedIncrease(currentProgress: number): number {
    // Implement logic to determine maximum allowed progress increase
    // This could be based on game rules, user level, etc.
    return Math.max(10, currentProgress * 0.2); // 20% increase or minimum 10 points
  }

  private hasRepetitivePattern(actions: string[]): boolean {
    if (actions.length < 10) return false;

    // Check for same action repeated multiple times
    const lastAction = actions[0];
    const repetitionCount = actions
      .slice(0, 10)
      .filter((action) => action === lastAction).length;

    return repetitionCount >= 8; // 80% same action
  }

  private hasImpossibleSequence(actions: string[]): boolean {
    if (actions.length < 3) return false;

    // Example: Cannot complete quest before starting it
    const sequences = actions.join(',');
    const impossiblePatterns = [
      'quest_complete,quest_start',
      'achievement_complete,achievement_start',
    ];

    return impossiblePatterns.some((pattern) => sequences.includes(pattern));
  }

  private async logSuspiciousActivity(
    userId: string,
    type: string,
    details: Record<string, any>
  ): Promise<void> {
    const log = {
      userId,
      type,
      details,
      timestamp: new Date().toISOString(),
    };

    // Log to monitoring system
    logger.warn('Suspicious activity detected:', log);
    createCustomMetric('anticheat.suspicious_activity', 1, { type });

    // Store in Redis for analysis
    await this.redis.lpush('suspicious_activities', JSON.stringify(log));
    await this.redis.ltrim('suspicious_activities', 0, 999); // Keep last 1000 entries

    // Update user risk score
    await this.updateUserRiskScore(userId, type);
  }

  private async updateUserRiskScore(
    userId: string,
    violationType: string
  ): Promise<void> {
    const key = `risk_score:${userId}`;
    const currentScore = parseInt((await this.redis.get(key)) || '0');

    const violationScores: { [key: string]: number } = {
      rate_limit_exceeded: 1,
      abnormal_progress: 2,
      time_based_violation: 2,
      repetitive_pattern: 3,
      impossible_sequence: 4,
      multiple_ips: 3,
      multiple_sessions: 2,
    };

    const newScore = Math.min(
      100,
      currentScore + (violationScores[violationType] || 1)
    );
    await this.redis.set(key, newScore.toString());

    if (newScore >= 50) {
      // Trigger automated actions for high-risk users
      await this.handleHighRiskUser(userId, newScore);
    }
  }

  private async handleHighRiskUser(
    userId: string,
    riskScore: number
  ): Promise<void> {
    if (riskScore >= 80) {
      // Temporary ban
      await this.userService.updateUser(userId, { status: 'suspended' });
      logger.warn(
        `User ${userId} suspended due to high risk score: ${riskScore}`
      );
    } else if (riskScore >= 50) {
      // Increased monitoring
      await this.redis.set(`monitoring:${userId}`, 'enhanced');
      logger.warn(
        `Enhanced monitoring enabled for user ${userId}, risk score: ${riskScore}`
      );
    }
  }
}
