# Gamification Service Guide

## Overview
The Gamification Service is built with Express and provides core gamification features like achievements, quests, rewards, and progress tracking. It uses an event-driven architecture for real-time updates and CQRS for command handling.

## Core Features
- Achievement system
- Quest management
- Reward distribution
- Progress tracking
- Real-time updates
- Analytics integration
- Anti-cheat mechanisms

## Technical Stack
- Express framework
- PostgreSQL database
- Redis for caching
- RabbitMQ for events
- WebSocket for real-time
- TypeScript for type safety

## Domain Models

### Achievement System
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  category: AchievementCategory;
  points: number;
  requirements: AchievementRequirement[];
  rewards: Reward[];
  metadata: Record<string, any>;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum AchievementType {
  MILESTONE = 'MILESTONE',
  COLLECTION = 'COLLECTION',
  PROGRESSION = 'PROGRESSION',
  DISCOVERY = 'DISCOVERY',
  SKILL = 'SKILL',
  SOCIAL = 'SOCIAL',
  CHALLENGE = 'CHALLENGE',
  SECRET = 'SECRET'
}

interface AchievementRequirement {
  type: RequirementType;
  metric: string;
  threshold: number;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  timeframe?: {
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
  };
}

interface AchievementProgress {
  userId: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  metrics: Record<string, number>;
  history: ProgressEntry[];
}
```

### Quest System
```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  steps: QuestStep[];
  rewards: Reward[];
  requirements: QuestRequirement[];
  timeLimit?: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

interface QuestStep {
  id: string;
  title: string;
  description: string;
  order: number;
  requirements: QuestRequirement[];
  rewards?: Reward[];
  isOptional: boolean;
}

interface QuestProgress {
  userId: string;
  questId: string;
  status: QuestStatus;
  currentStep: number;
  progress: number;
  stepProgress: Record<string, number>;
  startedAt: Date;
  completedAt?: Date;
  history: ProgressEntry[];
}

enum QuestStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}
```

### Reward System
```typescript
interface Reward {
  id: string;
  type: RewardType;
  value: number;
  currency?: string;
  items?: RewardItem[];
  metadata: Record<string, any>;
  expiresAt?: Date;
}

interface RewardItem {
  id: string;
  type: string;
  quantity: number;
  metadata: Record<string, any>;
}

interface RewardDistribution {
  id: string;
  userId: string;
  rewardId: string;
  source: RewardSource;
  sourceId: string;
  status: RewardStatus;
  claimedAt?: Date;
  expiresAt?: Date;
}

enum RewardStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}
```

## Service Architecture

### Command Handlers
```typescript
interface AchievementCommands {
  CreateAchievement: {
    title: string;
    description: string;
    type: AchievementType;
    requirements: AchievementRequirement[];
    rewards: Reward[];
  };
  UpdateProgress: {
    userId: string;
    achievementId: string;
    metrics: Record<string, number>;
  };
  ClaimReward: {
    userId: string;
    achievementId: string;
  };
}

class AchievementCommandHandlers {
  @CommandHandler(CreateAchievementCommand)
  async handleCreate(command: CreateAchievementCommand): Promise<void> {
    const achievement = await this.achievementRepository.create({
      ...command,
      isEnabled: true,
      createdAt: new Date(),
    });

    await this.eventBus.publish(new AchievementCreatedEvent(achievement));
  }

  @CommandHandler(UpdateProgressCommand)
  async handleProgressUpdate(command: UpdateProgressCommand): Promise<void> {
    const progress = await this.progressRepository.findOrCreate(
      command.userId,
      command.achievementId
    );

    const updated = await this.progressService.updateProgress(
      progress,
      command.metrics
    );

    if (updated.isCompleted && !progress.isCompleted) {
      await this.eventBus.publish(
        new AchievementCompletedEvent(command.userId, command.achievementId)
      );
    }
  }
}
```

### Event Handlers
```typescript
interface AchievementEvents {
  AchievementCreated: {
    achievement: Achievement;
  };
  AchievementCompleted: {
    userId: string;
    achievementId: string;
    timestamp: Date;
  };
  RewardClaimed: {
    userId: string;
    achievementId: string;
    rewards: Reward[];
    timestamp: Date;
  };
}

class AchievementEventHandlers {
  @EventHandler(AchievementCompletedEvent)
  async handleCompletion(event: AchievementCompletedEvent): Promise<void> {
    // Update user statistics
    await this.userStatsService.incrementAchievements(event.userId);

    // Distribute rewards
    const achievement = await this.achievementRepository.findById(
      event.achievementId
    );
    await this.rewardService.distributeRewards(
      event.userId,
      achievement.rewards,
      {
        source: 'ACHIEVEMENT',
        sourceId: event.achievementId,
      }
    );

    // Notify user
    await this.notificationService.send({
      userId: event.userId,
      type: 'ACHIEVEMENT_COMPLETED',
      title: `Achievement Unlocked: ${achievement.title}`,
      data: {
        achievementId: event.achievementId,
        rewards: achievement.rewards,
      },
    });
  }
}
```

### Services
```typescript
interface AchievementService {
  createAchievement(data: CreateAchievementDto): Promise<Achievement>;
  updateProgress(userId: string, metrics: Record<string, number>): Promise<void>;
  getProgress(userId: string, achievementId: string): Promise<AchievementProgress>;
  listAchievements(filters: AchievementFilters): Promise<Achievement[]>;
  validateRequirements(
    requirements: AchievementRequirement[],
    metrics: Record<string, number>
  ): Promise<boolean>;
}

interface QuestService {
  createQuest(data: CreateQuestDto): Promise<Quest>;
  startQuest(userId: string, questId: string): Promise<QuestProgress>;
  updateProgress(userId: string, questId: string, stepId: string): Promise<void>;
  completeQuest(userId: string, questId: string): Promise<void>;
  listActiveQuests(userId: string): Promise<Quest[]>;
}

interface RewardService {
  createReward(data: CreateRewardDto): Promise<Reward>;
  distributeReward(
    userId: string,
    rewardId: string,
    source: RewardSource
  ): Promise<void>;
  claimReward(userId: string, distributionId: string): Promise<void>;
  listPendingRewards(userId: string): Promise<RewardDistribution[]>;
}
```

## Implementation

### Express Routes
```typescript
// Achievement routes
router.post(
  '/achievements',
  validateSchema(createAchievementSchema),
  async (req, res) => {
    const achievement = await achievementService.createAchievement(req.body);
    res.status(201).json(achievement);
  }
);

router.post(
  '/achievements/:id/progress',
  validateSchema(updateProgressSchema),
  async (req, res) => {
    await achievementService.updateProgress(
      req.user.id,
      req.params.id,
      req.body.metrics
    );
    res.status(200).end();
  }
);

// Quest routes
router.post('/quests/:id/start', async (req, res) => {
  const progress = await questService.startQuest(req.user.id, req.params.id);
  res.status(200).json(progress);
});

router.post('/quests/:id/steps/:stepId/complete', async (req, res) => {
  await questService.updateProgress(req.user.id, req.params.id, req.params.stepId);
  res.status(200).end();
});

// Reward routes
router.post('/rewards/:id/claim', async (req, res) => {
  await rewardService.claimReward(req.user.id, req.params.id);
  res.status(200).end();
});
```

### WebSocket Integration
```typescript
interface GameEvent {
  type: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}

class GameEventHandler {
  constructor(
    private readonly wss: WebSocket.Server,
    private readonly userConnections: Map<string, WebSocket[]>
  ) {}

  handleEvent(event: GameEvent): void {
    const connections = this.userConnections.get(event.userId) || [];
    
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
      }
    });
  }

  handleConnection(ws: WebSocket, userId: string): void {
    const connections = this.userConnections.get(userId) || [];
    connections.push(ws);
    this.userConnections.set(userId, connections);

    ws.on('close', () => {
      const connections = this.userConnections.get(userId) || [];
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
        this.userConnections.set(userId, connections);
      }
    });
  }
}
```

## Configuration

### Development Environment
```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamification
DB_USER=postgres
DB_PASSWORD=postgres

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=gamification

# WebSocket Configuration
WS_PORT=3001
WS_PATH=/game-events

# Feature Flags
ENABLE_ANTI_CHEAT=true
ENABLE_REAL_TIME=true
ENABLE_ANALYTICS=true
```

### Production Environment
```env
# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration
DB_HOST=db.production.com
DB_PORT=5432
DB_NAME=gamification
DB_USER=app
DB_PASSWORD=secure-password

# Redis Configuration
REDIS_HOST=redis.production.com
REDIS_PORT=6379
REDIS_PASSWORD=secure-password
REDIS_DB=0

# RabbitMQ Configuration
RABBITMQ_URL=amqp://rabbitmq.production.com:5672
RABBITMQ_EXCHANGE=gamification
RABBITMQ_USER=app
RABBITMQ_PASSWORD=secure-password

# WebSocket Configuration
WS_PORT=3001
WS_PATH=/game-events
WS_MAX_CONNECTIONS=10000

# Feature Flags
ENABLE_ANTI_CHEAT=true
ENABLE_REAL_TIME=true
ENABLE_ANALYTICS=true
```

## Related Guides
- [Core Architecture](../core/architecture.md)
- [Event System](../core/event-system.md)
- [API Gateway](../core/api-gateway.md)
- [Analytics Service](analytics.md) 