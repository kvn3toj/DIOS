import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';
import {
  BASE_URL,
  GRAPHQL_URL,
  STRESS_TEST_CONFIG,
  ENDPOINTS,
  GRAPHQL_QUERIES,
  TEST_USER
} from './config';

// Custom metrics
const failureRate = new Rate('failed_requests');
const successfulTransactions = new Counter('successful_transactions');
const errorRate = new Rate('error_rate');
const timeoutRate = new Rate('timeout_rate');

// Default options for stress testing
export const options = STRESS_TEST_CONFIG;

// Initialize test data
const testData = {
  userId: '',
  achievementId: '',
  questId: '',
  authToken: ''
};

// Setup function runs once before the test
export function setup() {
  // Authenticate and get test user data
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const authData = loginRes.json();
  testData.userId = authData.user.id;
  testData.authToken = authData.token;

  // Create test achievement and quest
  const achievementRes = http.post(
    `${BASE_URL}${ENDPOINTS.achievements.create}`,
    JSON.stringify({
      name: 'Stress Test Achievement',
      description: 'Test Description',
      points: 100,
      criteria: JSON.stringify({ type: 'score', target: 1000 }),
      category: 'TEST'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testData.authToken}`
      }
    }
  );

  const questRes = http.post(
    `${BASE_URL}${ENDPOINTS.quests.create}`,
    JSON.stringify({
      name: 'Stress Test Quest',
      description: 'Test Description',
      type: 'DAILY',
      difficulty: 'EASY',
      experienceReward: 100,
      pointsReward: 50,
      objectives: [{ type: 'score', target: 1000, order: 1 }]
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testData.authToken}`
      }
    }
  );

  check(achievementRes, { 'achievement created': (r) => r.status === 200 });
  check(questRes, { 'quest created': (r) => r.status === 200 });

  testData.achievementId = achievementRes.json().data.id;
  testData.questId = questRes.json().data.id;

  return testData;
}

// Default function that runs for each virtual user
export default function(data: typeof testData) {
  // Simulate heavy concurrent operations
  const batch = {
    // Achievement operations
    achievementProgress: {
      method: 'POST',
      url: `${BASE_URL}${ENDPOINTS.achievements.progress(data.userId, data.achievementId)}`,
      body: JSON.stringify({ progress: Math.random() * 100 }),
      params: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    },
    // Quest operations
    questProgress: {
      method: 'POST',
      url: `${BASE_URL}${ENDPOINTS.quests.progress(data.userId, data.questId)}`,
      body: JSON.stringify({ objectiveIndex: 0, value: Math.random() * 100 }),
      params: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    },
    // Analytics events
    analyticsEvent: {
      method: 'POST',
      url: `${BASE_URL}${ENDPOINTS.analytics.events}`,
      body: JSON.stringify({
        userId: data.userId,
        type: 'USER_ACTION',
        category: 'ENGAGEMENT',
        event: 'stress_test_event',
        data: { value: 1 }
      }),
      params: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    },
    // GraphQL operations
    graphqlQueries: {
      method: 'POST',
      url: GRAPHQL_URL,
      body: JSON.stringify({
        query: `
          query StressTest($userId: ID!, $achievementId: ID!) {
            achievement(id: $achievementId) {
              id
              name
              progress(userId: $userId) {
                currentValue
                completed
              }
            }
            userAchievements(userId: $userId) {
              id
              currentValue
            }
            leaderboard(timeframe: "daily", limit: 10) {
              id
              points
            }
          }
        `,
        variables: {
          userId: data.userId,
          achievementId: data.achievementId
        }
      }),
      params: {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    }
  };

  // Execute batch requests with a timeout
  const responses = http.batch(Object.values(batch));
  
  // Check responses and update metrics
  responses.forEach((response, index) => {
    const name = Object.keys(batch)[index];
    const isTimeout = response.timings.duration >= 10000; // 10s timeout
    const isSuccess = response.status === 200 && !isTimeout;

    if (isSuccess) {
      successfulTransactions.add(1);
    }

    if (isTimeout) {
      timeoutRate.add(1);
    }

    const success = check(response, {
      [`${name} status 200`]: (r) => r.status === 200,
      [`${name} response time < 2000ms`]: (r) => r.timings.duration < 2000,
    });

    if (!success) {
      failureRate.add(1);
      errorRate.add(1);
    }
  });

  // Random sleep between 0.1 and 0.5 seconds to simulate real user behavior
  sleep(Math.random() * 0.4 + 0.1);
}

// Teardown function runs once after the test
export function teardown(data: typeof testData) {
  // Clean up test data
  const cleanup = {
    achievement: http.del(
      `${BASE_URL}${ENDPOINTS.achievements.delete(data.achievementId)}`,
      null,
      { headers: { 'Authorization': `Bearer ${data.authToken}` } }
    ),
    quest: http.del(
      `${BASE_URL}${ENDPOINTS.quests.delete(data.questId)}`,
      null,
      { headers: { 'Authorization': `Bearer ${data.authToken}` } }
    )
  };

  Object.entries(cleanup).forEach(([name, response]) => {
    check(response, {
      [`${name} cleanup successful`]: (r) => r.status === 200
    });
  });
} 