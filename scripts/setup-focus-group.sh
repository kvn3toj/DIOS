#!/bin/bash

echo "Setting up local environment for focus group testing..."

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Navigate to analytics service
cd backend/analytics

# Install dependencies
echo "Installing dependencies..."
npm install

# Run migrations
echo "Running database migrations..."
npm run migration:run

# Generate mock data
echo "Generating mock data..."
npm run save-mock-data

# Generate game data
echo "Generating game data..."
npm run generate-game-data

echo "Setup complete! Local environment is ready for focus group testing."
echo "
Focus Group Environment Details:
- Database: PostgreSQL running on localhost:5432
- Redis: Running on localhost:6379
- RabbitMQ: Running on localhost:5672
- Analytics Service: Ready with mock data
- Achievement System: Populated with test data
- Quest System: Populated with test data

Next steps:
1. Review testing scenarios in docs/focus-group/testing-scenarios.md
2. Prepare feedback forms from docs/focus-group/feedback-form.md
3. Start the application using 'npm run dev'
4. Access the analytics dashboard at http://localhost:3000/analytics
" 