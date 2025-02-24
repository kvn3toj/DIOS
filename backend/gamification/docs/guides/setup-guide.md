# Setup Guide

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- Docker and Docker Compose
- Git
- pnpm (v8 or higher)
- TypeScript (v5 or higher)

### Development Tools
- VS Code (recommended)
- Postman/Insomnia for API testing
- MongoDB Compass for database management
- Redis Commander for cache inspection

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/gamification-service.git
cd gamification-service
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Configure environment variables
# Required variables:
# - DATABASE_URL
# - REDIS_URL
# - RABBITMQ_URL
# - JWT_SECRET
# - API_KEY
```

### 3. Install Dependencies
```bash
# Install pnpm if not installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 4. Infrastructure Setup

#### Start Required Services
```bash
# Start infrastructure services
docker-compose up -d

# Services started:
# - PostgreSQL (5432)
# - Redis (6379)
# - RabbitMQ (5672, 15672)
# - Kong Gateway (8000, 8001)
# - Elasticsearch (9200)
```

#### Database Setup
```bash
# Run database migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

## Development Environment

### 1. IDE Setup

#### VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Docker
- REST Client
- GraphQL
- Mermaid Preview

#### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### 2. Development Server

#### Start Development Server
```bash
# Start in development mode
pnpm dev

# Start with debugging
pnpm dev:debug

# Start with specific service
pnpm dev:gamification
```

#### Available Scripts
```bash
# Run tests
pnpm test           # Run all tests
pnpm test:unit     # Run unit tests
pnpm test:int      # Run integration tests
pnpm test:e2e      # Run e2e tests

# Build
pnpm build         # Build all packages
pnpm build:prod    # Production build

# Linting
pnpm lint          # Run linter
pnpm lint:fix      # Fix linting issues

# Type checking
pnpm type-check    # Run TypeScript compiler
```

## Service Configuration

### 1. API Gateway Setup
```bash
# Configure Kong routes
pnpm gateway:setup

# Verify gateway status
curl http://localhost:8001/status
```

### 2. Event Bus Configuration
```bash
# Configure RabbitMQ exchanges and queues
pnpm events:setup

# Monitor RabbitMQ
open http://localhost:15672
```

### 3. Cache Configuration
```bash
# Configure Redis
pnpm cache:setup

# Monitor Redis
open http://localhost:8081
```

## Testing Setup

### 1. Test Environment
```bash
# Setup test database
pnpm test:setup

# Generate test data
pnpm test:seed
```

### 2. Performance Testing
```bash
# Install k6
brew install k6

# Run performance tests
pnpm test:perf
```

## Debugging

### 1. Logging
```bash
# View service logs
pnpm logs

# View specific service logs
pnpm logs:gamification

# Enable debug logging
DEBUG=* pnpm dev
```

### 2. Debugging Tools
```bash
# Start debugging session
pnpm debug

# Attach debugger
pnpm debug:attach
```

## Common Issues and Solutions

### 1. Database Connection Issues
- Verify PostgreSQL is running: `docker ps | grep postgres`
- Check connection string in `.env`
- Ensure database exists: `createdb gamification`

### 2. Event Bus Issues
- Verify RabbitMQ is running: `docker ps | grep rabbitmq`
- Check RabbitMQ management console
- Verify queue bindings: `pnpm events:verify`

### 3. Cache Issues
- Verify Redis is running: `docker ps | grep redis`
- Clear Redis cache: `pnpm cache:clear`
- Monitor Redis memory: `redis-cli info memory`

## Development Workflow

### 1. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Start development server
pnpm dev

# Run tests
pnpm test

# Commit changes
git commit -m "feat: your feature description"
```

### 2. Code Quality
```bash
# Before committing
pnpm pre-commit    # Runs linting, type checking, and tests

# Format code
pnpm format

# Check types
pnpm type-check
```

### 3. Submitting Changes
```bash
# Update branch
git pull origin main
git rebase main

# Push changes
git push origin feature/your-feature

# Create pull request
gh pr create
```

## Deployment

### 1. Local Deployment
```bash
# Build services
pnpm build

# Start production server
pnpm start
```

### 2. Docker Deployment
```bash
# Build Docker image
docker build -t gamification-service .

# Run container
docker run -p 3000:3000 gamification-service
```

## Additional Resources

### Documentation
- [API Documentation](../api/rest-api.yaml)
- [Architecture Overview](../architecture/overview.md)
- [Event Schema](../api/event-schema.md)

### Tools and Services
- [Kong Dashboard](http://localhost:8001)
- [RabbitMQ Management](http://localhost:15672)
- [Redis Commander](http://localhost:8081)
- [Elasticsearch](http://localhost:9200)

### Support
- Create issues in the repository
- Contact the development team
- Check the troubleshooting guide 