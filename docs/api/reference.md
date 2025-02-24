# API Reference Documentation

## Overview

This document provides detailed information about the SuperApp and Gamifier 2.0 API endpoints. The API is organized around REST and GraphQL, with predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.

## Base URLs

- **Production**: `https://api.superapp.com`
- **Staging**: `https://api.staging.superapp.com`
- **Development**: `http://localhost:3000`

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

## REST API Endpoints

### User Management

#### Create User
```http
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

Response:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-03-20T10:00:00Z"
}
```

#### Get User Profile
```http
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "profile": {
    "bio": "User bio",
    "avatar": "avatar_url",
    "social": {}
  }
}
```

### Content Management

#### Create Content
```http
POST /api/v1/content
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "article",
  "title": "My Content",
  "body": "Content body",
  "metadata": {}
}
```

Response:
```json
{
  "id": "content_id",
  "type": "article",
  "title": "My Content",
  "status": "draft",
  "createdAt": "2024-03-20T10:00:00Z"
}
```

#### Search Content
```http
GET /api/v1/search/content
Authorization: Bearer <token>

Query Parameters:
- query: Search query string
- type: Content type filter
- status: Content status filter
- page: Page number
- limit: Items per page
```

Response:
```json
{
  "items": [{
    "id": "content_id",
    "type": "article",
    "title": "My Content"
  }],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Notifications

#### Get Notifications
```http
GET /api/v1/notifications
Authorization: Bearer <token>

Query Parameters:
- status: Filter by status (UNREAD, READ, ARCHIVED)
- type: Filter by type
- limit: Number of notifications to return
```

Response:
```json
{
  "notifications": [{
    "id": "notification_id",
    "type": "SOCIAL",
    "title": "New follower",
    "content": "User started following you",
    "status": "UNREAD",
    "createdAt": "2024-03-20T10:00:00Z"
  }],
  "unreadCount": 5
}
```

#### Update Notification Status
```http
PUT /api/v1/notifications/{notificationId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "READ"
}
```

Response:
```json
{
  "id": "notification_id",
  "status": "READ",
  "updatedAt": "2024-03-20T10:05:00Z"
}
```

### Metrics and Analytics

#### Get Performance Metrics
```http
GET /api/v1/metrics/performance
Authorization: Bearer <token>
```

Response:
```json
{
  "response": {
    "p50": 100,
    "p95": 200,
    "p99": 300
  },
  "availability": {
    "uptime": 99.99,
    "reliability": 99.95
  },
  "resources": {
    "cpu": 45.5,
    "memory": 60.2
  }
}
```

#### Get Business Metrics
```http
GET /api/v1/metrics/business
Authorization: Bearer <token>

Query Parameters:
- startDate: Start date for metrics
- endDate: End date for metrics
- granularity: Data granularity (hour, day, week, month)
```

Response:
```json
{
  "users": {
    "active": {
      "daily": 1000,
      "weekly": 5000,
      "monthly": 15000
    },
    "retention": {
      "d1": 80,
      "d7": 60,
      "d30": 40
    }
  },
  "engagement": {
    "sessionsPerUser": 5.2,
    "avgSessionDuration": 300
  }
}
```

## GraphQL API

### Endpoint
```http
POST /graphql
Content-Type: application/json
Authorization: Bearer <token>
```

### Queries

#### Get User Profile
```graphql
query GetUserProfile($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    profile {
      bio
      avatar
      social {
        twitter
        github
      }
    }
    stats {
      followers
      following
      content
    }
  }
}
```

#### Search Content
```graphql
query SearchContent($query: String!, $type: ContentType, $limit: Int) {
  search(query: $query, type: $type, limit: $limit) {
    items {
      id
      type
      title
      excerpt
      author {
        id
        name
      }
      stats {
        views
        likes
        comments
      }
    }
    total
    hasMore
  }
}
```

### Mutations

#### Create Content
```graphql
mutation CreateContent($input: CreateContentInput!) {
  createContent(input: $input) {
    id
    type
    title
    status
    createdAt
  }
}
```

#### Update Profile
```graphql
mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    bio
    avatar
    updatedAt
  }
}
```

### Subscriptions

#### Watch Notifications
```graphql
subscription WatchNotifications {
  notifications {
    id
    type
    title
    content
    status
    createdAt
  }
}
```

## WebSocket API

### Connection
```javascript
const ws = new WebSocket('wss://api.superapp.com/ws');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_jwt_token'
  }));
};
```

### Events

#### Real-time Notifications
```javascript
// Server -> Client
{
  "type": "notification",
  "data": {
    "id": "notification_id",
    "type": "SOCIAL",
    "title": "New follower",
    "content": "User started following you",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

#### Activity Updates
```javascript
// Server -> Client
{
  "type": "activity",
  "data": {
    "id": "activity_id",
    "type": "comment",
    "user": {
      "id": "user_id",
      "name": "John Doe"
    },
    "target": {
      "id": "content_id",
      "type": "article"
    },
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

## Error Handling

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

## Rate Limiting

API requests are limited based on the user's plan:
- Free: 60 requests per minute
- Pro: 1000 requests per minute
- Enterprise: Custom limits

Rate limit headers are included in all responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 56
X-RateLimit-Reset: 1534567890
``` 