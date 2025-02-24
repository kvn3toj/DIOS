import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'apollo-server-express';
import { Achievement } from '../models/Achievement';
import { User } from '../models/User';
import { AchievementProgress } from '../models/AchievementProgress';
import { AchievementService } from '../services/AchievementService';
import { UserService } from '../services/UserService';

const achievementService = new AchievementService();
const userService = new UserService();

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type Achievement @key(fields: "id") {
    id: ID!
    name: String!
    description: String!
    points: Int!
    criteria: String!
    category: String!
    icon: String
    createdAt: String!
    updatedAt: String!
    progress(userId: ID!): AchievementProgress
  }

  type AchievementProgress @key(fields: "id") {
    id: ID!
    userId: ID!
    achievementId: ID!
    currentValue: Float!
    completed: Boolean!
    completedAt: String
    achievement: Achievement!
    user: User!
  }

  type User @key(fields: "id") {
    id: ID!
    achievements: [Achievement!]!
    progress: [AchievementProgress!]!
    totalPoints: Int!
  }

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
    leaderboard(
      timeframe: String
      category: String
      limit: Int = 10
    ): [User!]!
  }

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
      criteria: String!
      category: String!
      icon: String
    ): Achievement!
    updateAchievement(
      id: ID!
      name: String
      description: String
      points: Int
      criteria: String
      category: String
      icon: String
    ): Achievement!
    deleteAchievement(id: ID!): Boolean!
  }
`;

const resolvers = {
  Achievement: {
    __resolveReference: async (ref: { id: string }) => {
      return await achievementService.getAchievement(ref.id);
    },
    progress: async (achievement: Achievement, { userId }: { userId: string }) => {
      return await achievementService.getProgress(achievement.id, userId);
    }
  },

  AchievementProgress: {
    __resolveReference: async (ref: { id: string }) => {
      return await achievementService.getProgressById(ref.id);
    },
    achievement: async (progress: AchievementProgress) => {
      return await achievementService.getAchievement(progress.achievementId);
    },
    user: async (progress: AchievementProgress) => {
      return await userService.getUser(progress.userId);
    }
  },

  User: {
    __resolveReference: async (ref: { id: string }) => {
      return await userService.getUser(ref.id);
    },
    achievements: async (user: User) => {
      return await achievementService.getUserAchievements(user.id);
    },
    progress: async (user: User) => {
      return await achievementService.getUserProgress(user.id);
    },
    totalPoints: async (user: User) => {
      return await achievementService.getUserTotalPoints(user.id);
    }
  },

  Query: {
    achievement: async (_, { id }: { id: string }) => {
      return await achievementService.getAchievement(id);
    },
    achievements: async (_, { category, offset, limit }: { category?: string; offset: number; limit: number }) => {
      return await achievementService.getAchievements({ category, offset, limit });
    },
    userAchievements: async (_, { userId, completed, offset, limit }: { userId: string; completed?: boolean; offset: number; limit: number }) => {
      return await achievementService.getUserAchievements(userId, { completed, offset, limit });
    },
    leaderboard: async (_, { timeframe, category, limit }: { timeframe?: string; category?: string; limit: number }) => {
      return await achievementService.getLeaderboard({ timeframe, category, limit });
    }
  },

  Mutation: {
    updateAchievementProgress: async (_, { userId, achievementId, value }: { userId: string; achievementId: string; value: number }) => {
      return await achievementService.updateProgress(userId, achievementId, value);
    },
    resetProgress: async (_, { userId, achievementId }: { userId: string; achievementId: string }) => {
      return await achievementService.resetProgress(userId, achievementId);
    },
    createAchievement: async (_, achievement: Partial<Achievement>) => {
      return await achievementService.createAchievement(achievement);
    },
    updateAchievement: async (_, { id, ...updates }: { id: string } & Partial<Achievement>) => {
      return await achievementService.updateAchievement(id, updates);
    },
    deleteAchievement: async (_, { id }: { id: string }) => {
      return await achievementService.deleteAchievement(id);
    }
  }
};

export const schema = buildSubgraphSchema([{ typeDefs, resolvers }]); 