# GraphQL Schema Documentation

## Overview
This document outlines the GraphQL schema for the Gamification service, including types, queries, mutations, and subscriptions.

## Types

### Achievement
```graphql
type Achievement @key(fields: "id") {
  id: ID!
  name: String!
  description: String!
  type: AchievementType!
  rarity: AchievementRarity!
  points: Int!
  criteria: JSON!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  progress(userId: ID!): AchievementProgress
}

enum AchievementType {
  PROGRESSION
  COLLECTION
  EVENT
  SOCIAL
}

enum AchievementRarity {
  COMMON
  RARE
  EPIC
  LEGENDARY
}
```

### AchievementProgress
```graphql
type AchievementProgress @key(fields: "id") {
  id: ID!
  userId: ID!
  achievementId: ID!
  currentValue: Float!
  completed: Boolean!
  completedAt: DateTime
  achievement: Achievement!
  user: User!
}
```

### User
```graphql
type User @key(fields: "id") {
  id: ID!
  username: String!
  email: String!
  level: Int!
  experience: Int!
  points: Int!
  achievements: [Achievement!]!
  progress: [AchievementProgress!]!
  totalPoints: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Quest
```graphql
type Quest @key(fields: "id") {
  id: ID!
  name: String!
  description: String!
  type: QuestType!
  difficulty: QuestDifficulty!
  experienceReward: Int!
  pointsReward: Int!
  objectives: [QuestObjective!]!
  progress(userId: ID!): QuestProgress
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum QuestType {
  DAILY
  WEEKLY
  ACHIEVEMENT
  EVENT
}

enum QuestDifficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

type QuestObjective {
  type: String!
  target: Float!
  order: Int!
}
```

## Queries

### Achievement Queries
```graphql
type Query {
  achievement(id: ID!): Achievement
  achievements(
    category: String
    offset: Int = 0
    limit: Int = 10
  ): [Achievement!]!
  userAchievements(
    userId: ID!
    completed: Boolean
    offset: Int = 0
    limit: Int = 10
  ): [AchievementProgress!]!
}
```

### Quest Queries
```graphql
type Query {
  quest(id: ID!): Quest
  quests(
    type: QuestType
    difficulty: QuestDifficulty
    offset: Int = 0
    limit: Int = 10
  ): [Quest!]!
  userQuests(
    userId: ID!
    status: QuestStatus
    offset: Int = 0
    limit: Int = 10
  ): [QuestProgress!]!
}
```

### Leaderboard Queries
```graphql
type Query {
  leaderboard(
    timeframe: String
    category: String
    limit: Int = 10
  ): [User!]!
}
```

## Mutations

### Achievement Mutations
```graphql
type Mutation {
  updateAchievementProgress(
    userId: ID!
    achievementId: ID!
    value: Float!
  ): AchievementProgress!
  
  resetProgress(
    userId: ID!
    achievementId: ID!
  ): Boolean!
  
  createAchievement(
    name: String!
    description: String!
    points: Int!
    criteria: JSON!
    category: String!
    icon: String
  ): Achievement!
  
  updateAchievement(
    id: ID!
    name: String
    description: String
    points: Int
    criteria: JSON
    category: String
    icon: String
  ): Achievement!
  
  deleteAchievement(id: ID!): Boolean!
}
```

### Quest Mutations
```graphql
type Mutation {
  startQuest(
    userId: ID!
    questId: ID!
  ): QuestProgress!
  
  updateQuestProgress(
    userId: ID!
    questId: ID!
    objectiveIndex: Int!
    value: Float!
  ): QuestProgress!
  
  abandonQuest(
    userId: ID!
    questId: ID!
  ): Boolean!
}
```

## Subscriptions

### Achievement Subscriptions
```graphql
type Subscription {
  achievementUnlocked(userId: ID!): Achievement!
  progressUpdated(userId: ID!, achievementId: ID!): AchievementProgress!
}
```

### Quest Subscriptions
```graphql
type Subscription {
  questCompleted(userId: ID!): Quest!
  questProgressUpdated(userId: ID!, questId: ID!): QuestProgress!
}
```

## Directives

```graphql
directive @auth on FIELD_DEFINITION
directive @rateLimit(limit: Int!, duration: Int!) on FIELD_DEFINITION
directive @cacheControl(maxAge: Int, scope: CacheControlScope) on FIELD_DEFINITION
```

## Error Handling

GraphQL errors follow this structure:
```graphql
type Error {
  message: String!
  code: String!
  path: [String!]!
  locations: [Location!]!
}

type Location {
  line: Int!
  column: Int!
}
```

Common error codes:
- `UNAUTHENTICATED`: User is not authenticated
- `FORBIDDEN`: User lacks required permissions
- `NOT_FOUND`: Requested resource not found
- `BAD_REQUEST`: Invalid input parameters
- `INTERNAL_ERROR`: Server-side error

## Authentication

All queries and mutations requiring authentication should include a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Caching

Caching is implemented using Apollo Cache Control:
- Queries are cached by default for 300 seconds
- Mutations invalidate relevant cached queries
- Real-time updates are handled through subscriptions 