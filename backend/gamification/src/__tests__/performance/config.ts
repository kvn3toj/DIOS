export const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/v1';
export const GRAPHQL_URL = process.env.TEST_GRAPHQL_URL || 'http://localhost:3000/graphql';

export const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

export const LOAD_TEST_CONFIG = {
  // Load test runs with a medium load for a moderate duration
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 },  // Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 }    // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  }
};

export const STRESS_TEST_CONFIG = {
  // Stress test gradually increases load until the system breaks
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 },   // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 },   // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 },   // Stay at 200 users for 5 minutes
    { duration: '2m', target: 300 },   // Ramp up to 300 users over 2 minutes
    { duration: '5m', target: 300 },   // Stay at 300 users for 5 minutes
    { duration: '2m', target: 0 }      // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Less than 5% of requests should fail
  }
};

export const SCALABILITY_TEST_CONFIG = {
  // Scalability test checks how the system handles gradual increase in load
  stages: [
    { duration: '3m', target: 100 },   // Ramp up to 100 users over 3 minutes
    { duration: '5m', target: 100 },   // Stay at 100 users for 5 minutes
    { duration: '3m', target: 200 },   // Ramp up to 200 users over 3 minutes
    { duration: '5m', target: 200 },   // Stay at 200 users for 5 minutes
    { duration: '3m', target: 400 },   // Ramp up to 400 users over 3 minutes
    { duration: '5m', target: 400 },   // Stay at 400 users for 5 minutes
    { duration: '3m', target: 0 }      // Ramp down to 0 users over 3 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.02'],    // Less than 2% of requests should fail
    http_reqs: ['count>100000']        // Should handle at least 100k requests
  }
};

export const ENDPOINTS = {
  // REST API endpoints
  achievements: {
    list: '/achievements',
    create: '/achievements',
    get: (id: string) => `/achievements/${id}`,
    update: (id: string) => `/achievements/${id}`,
    delete: (id: string) => `/achievements/${id}`,
    progress: (userId: string, achievementId: string) => 
      `/achievements/user/${userId}/achievement/${achievementId}/progress`
  },
  quests: {
    list: '/quests',
    create: '/quests',
    get: (id: string) => `/quests/${id}`,
    update: (id: string) => `/quests/${id}`,
    progress: (userId: string, questId: string) => 
      `/quests/user/${userId}/quest/${questId}/progress`
  },
  users: {
    profile: (id: string) => `/users/${id}`,
    achievements: (id: string) => `/users/${id}/achievements`,
    quests: (id: string) => `/users/${id}/quests`
  },
  analytics: {
    events: '/analytics/events',
    metrics: '/analytics/metrics/summary',
    userEngagement: (userId: string) => `/analytics/user/${userId}/engagement`
  }
};

export const GRAPHQL_QUERIES = {
  // GraphQL queries
  getAchievement: `
    query GetAchievement($id: ID!) {
      achievement(id: $id) {
        id
        name
        description
        points
        criteria
        category
      }
    }
  `,
  getUserAchievements: `
    query GetUserAchievements($userId: ID!) {
      userAchievements(userId: $userId) {
        id
        userId
        achievementId
        currentValue
        completed
      }
    }
  `,
  getLeaderboard: `
    query GetLeaderboard($timeframe: String, $category: String, $limit: Int) {
      leaderboard(timeframe: $timeframe, category: $category, limit: $limit) {
        id
        username
        points
      }
    }
  `
}; 