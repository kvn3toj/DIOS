# Contributing Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Git Workflow](#git-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Code Review Process](#code-review-process)
8. [Release Process](#release-process)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Docker and Docker Compose
- Git

### Initial Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/gamification-service.git
   cd gamification-service
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original/gamification-service.git
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```

## Development Workflow

### Branch Naming Convention
- Feature: `feature/description`
- Bug Fix: `fix/description`
- Documentation: `docs/description`
- Performance: `perf/description`
- Refactoring: `refactor/description`

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style changes
- refactor: Code refactoring
- perf: Performance improvements
- test: Tests
- chore: Build process or tools

Example:
```
feat(achievements): add progress tracking system

- Implement achievement progress tracking
- Add progress update events
- Create progress repository

Closes #123
```

## Code Standards

### TypeScript Guidelines
- Use strict type checking
- Avoid `any` type
- Use interfaces for object shapes
- Use enums for fixed values
- Document public APIs with JSDoc

### Naming Conventions
- Classes: PascalCase
- Interfaces: PascalCase with 'I' prefix
- Methods/Functions: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case

### Code Organization
```typescript
// Imports order
import { external } from 'package';
import { internal } from '@internal';
import { local } from './local';

// Class structure
@Entity()
export class Example {
  // Properties
  private readonly property: string;

  // Constructor
  constructor() {}

  // Public methods
  public method(): void {}

  // Private methods
  private helperMethod(): void {}
}
```

### Error Handling
```typescript
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed:', {
    error,
    context: { /* relevant context */ }
  });
  throw new APIError(500, 'Operation failed');
}
```

## Git Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Keep branch up to date:
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```
4. Push changes and create PR
5. Address review comments
6. Squash and merge

## Testing Guidelines

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = {};
      
      // Act
      const result = method(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test Coverage Requirements
- Unit Tests: 80% coverage
- Integration Tests: Critical paths
- E2E Tests: Main user flows

### Performance Testing
- Load tests for API endpoints
- Stress tests for critical operations
- Scalability tests for infrastructure

## Documentation

### Required Documentation
- README.md
- API documentation
- Architecture diagrams
- Database schemas
- Event schemas
- Configuration guide

### Documentation Style
- Clear and concise
- Code examples
- Diagrams where helpful
- Regular updates

## Code Review Process

### Before Review
- Run all tests
- Update documentation
- Self-review changes
- Verify CI/CD pipeline

### Review Checklist
- [ ] Code follows standards
- [ ] Tests are adequate
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance considered
- [ ] Error handling complete

### Review Comments
- Be constructive
- Explain reasoning
- Suggest improvements
- Link to resources

## Release Process

### Version Control
- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog updates
- Release notes

### Release Steps
1. Create release branch
2. Update version
3. Run tests
4. Generate documentation
5. Create tag
6. Deploy to staging
7. Verify deployment
8. Deploy to production

### Hotfix Process
1. Branch from `main`
2. Fix issue
3. Create PR
4. Deploy to staging
5. Verify fix
6. Deploy to production
7. Backport to `develop`

## Support

### Getting Help
- GitHub Issues
- Development chat
- Documentation
- Team meetings

### Reporting Issues
- Use issue templates
- Provide reproduction steps
- Include relevant logs
- Add system information

## Continuous Improvement

### Feedback Process
- Regular retrospectives
- Developer surveys
- Performance metrics
- User feedback

### Learning Resources
- Internal wiki
- Architecture docs
- Code examples
- Training materials 