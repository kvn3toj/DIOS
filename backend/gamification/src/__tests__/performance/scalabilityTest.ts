import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';
import {
  BASE_URL,
  GRAPHQL_URL,
  SCALABILITY_TEST_CONFIG,
  ENDPOINTS,
  GRAPHQL_QUERIES,
  TEST_USER
} from './config';

// Custom metrics
const failureRate = new Rate('failed_requests');
const successfulTransactions = new Counter('successful_transactions');
const responseTime = new Trend('response_time');
const concurrentUsers = new Counter('concurrent_users');
const throughput = new Counter('requests_per_second');

// Default options for scalability testing
export const options = SCALABILITY_TEST_CONFIG;

// Initialize test data
const testData = {
  userId: '',
  achievementIds: [] as string[],
  questIds: [] as string[],
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

  // Create multiple test achievements and quests
  for (let i = 0; i < 5; i++) {
    const achievementRes = http.post(
      `${BASE_URL}${ENDPOINTS.achievements.create}`,
      JSON.stringify({
        name: `Scalability Test Achievement ${i}`,
        description: 'Test Description',
        points: 100 * (i + 1),
        criteria: JSON.stringify({ type: 'score', target: 1000 * (i + 1) }),
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
        name: `Scalability Test Quest ${i}`,
        description: 'Test Description',
        type: 'DAILY',
        difficulty: 'EASY',
        experienceReward: 100 * (i + 1),
        pointsReward: 50 * (i + 1),
        objectives: [{ type: 'score', target: 1000 * (i + 1), order: 1 }]
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

    testData.achievementIds.push(achievementRes.json().data.id);
    testData.questIds.push(questRes.json().data.id);
  }

  return testData;
}

// Default function that runs for each virtual user
export default function(data: typeof testData) {
  // Track concurrent users
  concurrentUsers.add(1);
  const startTime = new Date().getTime();

  try {
    // Simulate complex user interactions
    const operations = [
      // Achievement operations
      ...data.achievementIds.map(achievementId => ({
        method: 'POST',
        url: `${BASE_URL}${ENDPOINTS.achievements.progress(data.userId, achievementId)}`,
        body: JSON.stringify({ progress: Math.random() * 100 }),
        params: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.authToken}`
          }
        }
      })),

      // Quest operations
      ...data.questIds.map(questId => ({
        method: 'POST',
        url: `${BASE_URL}${ENDPOINTS.quests.progress(data.userId, questId)}`,
        body: JSON.stringify({ objectiveIndex: 0, value: Math.random() * 100 }),
        params: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.authToken}`
          }
        }
      })),

      // Analytics events
      {
        method: 'POST',
        url: `${BASE_URL}${ENDPOINTS.analytics.events}`,
        body: JSON.stringify({
          userId: data.userId,
          type: 'USER_ACTION',
          category: 'ENGAGEMENT',
          event: 'scalability_test_event',
          data: { value: 1 }
        }),
        params: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.authToken}`
          }
        }
      },

      // Complex GraphQL query
      {
        method: 'POST',
        url: GRAPHQL_URL,
        body: JSON.stringify({
          query: `
            query ScalabilityTest($userId: ID!, $achievementIds: [ID!]!) {
              achievements(ids: $achievementIds) {
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
            achievementIds: data.achievementIds
          }
        }),
        params: {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.authToken}`
          }
        }
      }
    ];

    // Execute all operations in batch
    const responses = http.batch(operations);
    
    // Track metrics
    responses.forEach((response, index) => {
      const isTimeout = response.timings.duration >= 10000; // 10s timeout
      const isSuccess = response.status === 200 && !isTimeout;

      // Track response time
      responseTime.add(response.timings.duration);

      if (isSuccess) {
        successfulTransactions.add(1);
      } else {
        failureRate.add(1);
      }

      // Verify response
      check(response, {
        'status 200': (r) => r.status === 200,
        'response time < 1000ms': (r) => r.timings.duration < 1000,
      });
    });

    // Calculate throughput
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    throughput.add(responses.length / duration);

  } finally {
    // Ensure we always decrement concurrent users count
    concurrentUsers.add(-1);
  }

  // Variable sleep time based on current stage
  const currentStage = Math.floor(__VU / 100); // Virtual User count / 100 to determine stage
  const sleepTime = Math.max(0.1, 1 - (currentStage * 0.2)); // Decrease sleep time as load increases
  sleep(sleepTime);
}

// Teardown function runs once after the test
export function teardown(data: typeof testData) {
  // Clean up test data
  const cleanup = {
    achievements: data.achievementIds.map(id => 
      http.del(
        `${BASE_URL}${ENDPOINTS.achievements.delete(id)}`,
        null,
        { headers: { 'Authorization': `Bearer ${data.authToken}` } }
      )
    ),
    quests: data.questIds.map(id => 
      http.del(
        `${BASE_URL}${ENDPOINTS.quests.delete(id)}`,
        null,
        { headers: { 'Authorization': `Bearer ${data.authToken}` } }
      )
    )
  };

  // Verify cleanup
  cleanup.achievements.forEach((response, index) => {
    check(response, {
      [`achievement ${index} cleanup successful`]: (r) => r.status === 200
    });
  });

  cleanup.quests.forEach((response, index) => {
    check(response, {
      [`quest ${index} cleanup successful`]: (r) => r.status === 200
    });
  });
} 