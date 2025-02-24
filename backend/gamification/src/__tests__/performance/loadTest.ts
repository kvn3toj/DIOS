import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import {
  BASE_URL,
  GRAPHQL_URL,
  LOAD_TEST_CONFIG,
  ENDPOINTS,
  GRAPHQL_QUERIES,
  TEST_USER
} from './config';

// Custom metrics
const failureRate = new Rate('failed_requests');

// Default options for load testing
export const options = LOAD_TEST_CONFIG;

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

  // Create test achievement
  const achievementRes = http.post(
    `${BASE_URL}${ENDPOINTS.achievements.create}`,
    JSON.stringify({
      name: 'Test Achievement',
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

  check(achievementRes, {
    'achievement created': (r) => r.status === 200,
  });

  testData.achievementId = achievementRes.json().data.id;

  return testData;
}

// Default function that runs for each virtual user
export default function(data: typeof testData) {
  // Test REST API endpoints
  const requests = {
    achievements: http.get(
      `${BASE_URL}${ENDPOINTS.achievements.list}`,
      { headers: { 'Authorization': `Bearer ${data.authToken}` } }
    ),
    userProfile: http.get(
      `${BASE_URL}${ENDPOINTS.users.profile(data.userId)}`,
      { headers: { 'Authorization': `Bearer ${data.authToken}` } }
    ),
    userAchievements: http.get(
      `${BASE_URL}${ENDPOINTS.users.achievements(data.userId)}`,
      { headers: { 'Authorization': `Bearer ${data.authToken}` } }
    ),
    achievementProgress: http.post(
      `${BASE_URL}${ENDPOINTS.achievements.progress(data.userId, data.achievementId)}`,
      JSON.stringify({ progress: Math.random() * 100 }),
      { headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.authToken}`
      }}
    )
  };

  // Check REST API responses
  Object.entries(requests).forEach(([name, response]) => {
    const success = check(response, {
      [`${name} status 200`]: (r) => r.status === 200,
      [`${name} response time < 500ms`]: (r) => r.timings.duration < 500,
    });
    failureRate.add(!success);
  });

  // Test GraphQL endpoints
  const queries = {
    getAchievement: http.post(
      GRAPHQL_URL,
      JSON.stringify({
        query: GRAPHQL_QUERIES.getAchievement,
        variables: { id: data.achievementId }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    ),
    getUserAchievements: http.post(
      GRAPHQL_URL,
      JSON.stringify({
        query: GRAPHQL_QUERIES.getUserAchievements,
        variables: { userId: data.userId }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    ),
    getLeaderboard: http.post(
      GRAPHQL_URL,
      JSON.stringify({
        query: GRAPHQL_QUERIES.getLeaderboard,
        variables: {
          timeframe: 'weekly',
          category: 'all',
          limit: 10
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.authToken}`
        }
      }
    )
  };

  // Check GraphQL responses
  Object.entries(queries).forEach(([name, response]) => {
    const success = check(response, {
      [`${name} status 200`]: (r) => r.status === 200,
      [`${name} no errors`]: (r) => !r.json().errors,
      [`${name} response time < 500ms`]: (r) => r.timings.duration < 500,
    });
    failureRate.add(!success);
  });

  // Track analytics event
  const analyticsRes = http.post(
    `${BASE_URL}${ENDPOINTS.analytics.events}`,
    JSON.stringify({
      userId: data.userId,
      type: 'USER_ACTION',
      category: 'ENGAGEMENT',
      event: 'test_event',
      data: { value: 1 }
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.authToken}`
      }
    }
  );

  check(analyticsRes, {
    'analytics event tracked': (r) => r.status === 200,
  });

  // Sleep between iterations
  sleep(1);
}

// Teardown function runs once after the test
export function teardown(data: typeof testData) {
  // Clean up test data
  http.del(
    `${BASE_URL}${ENDPOINTS.achievements.delete(data.achievementId)}`,
    null,
    {
      headers: { 'Authorization': `Bearer ${data.authToken}` }
    }
  );
} 