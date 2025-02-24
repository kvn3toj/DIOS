# SuperApp and Gamifier 2.0

A comprehensive microservices-based application that combines a super app platform with advanced gamification features.

## Project Structure

```
superapp-gamifier/
├── frontend/
│   ├── superapp/     # Main application frontend (Next.js)
│   └── gamifier/     # Gamification dashboard (Vite)
├── backend/
│   ├── gamification/ # Gamification service (Express)
│   ├── social/       # Social features service (NestJS)
│   └── analytics/    # Analytics service (Express)
├── shared/           # Shared utilities and types
├── infrastructure/   # Infrastructure as code
└── docs/            # Documentation
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 10.2.4
- Docker (for local development)
- Redis
- PostgreSQL

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd superapp-gamifier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```

## Architecture

This project follows a microservices architecture with:

- Frontend using Next.js (App Router) and Vite
- Backend services using Express and NestJS
- Event-driven communication using Redis and RabbitMQ
- GraphQL federation for API management
- Enterprise-grade API gateway

## Development

- `npm run dev` - Start development servers
- `npm run build` - Build all packages
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## Documentation

Detailed documentation can be found in the `/docs` directory:

- Architecture Overview
- API Documentation
- Development Guidelines
- Deployment Guide

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

[License Type] - See LICENSE file for details 