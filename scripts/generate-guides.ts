import * as fs from 'fs';
import * as path from 'path';

interface GuideStructure {
  path: string;
  title: string;
  sections: {
    title: string;
    subsections?: string[];
    codeExample?: boolean;
  }[];
}

const guides: GuideStructure[] = [
  // Services
  {
    path: 'services/gamification.md',
    title: 'Gamification Service Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Core Features' },
      { title: 'Technical Stack' },
      { title: 'Domain Models', codeExample: true },
      { title: 'Service Architecture', codeExample: true },
      { title: 'Implementation', codeExample: true },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  {
    path: 'services/analytics.md',
    title: 'Analytics Service Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Data Collection' },
      { title: 'Processing Pipeline', codeExample: true },
      { title: 'Storage Strategy' },
      { title: 'Query Interface', codeExample: true },
      { title: 'Visualization' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  // Development
  {
    path: 'development/testing.md',
    title: 'Testing Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Test Strategy' },
      { title: 'Unit Testing', codeExample: true },
      { title: 'Integration Testing', codeExample: true },
      { title: 'E2E Testing', codeExample: true },
      { title: 'Performance Testing' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  {
    path: 'development/cicd.md',
    title: 'CI/CD Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Pipeline Structure' },
      { title: 'Build Process', codeExample: true },
      { title: 'Testing Strategy' },
      { title: 'Deployment Process', codeExample: true },
      { title: 'Monitoring' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  // Features
  {
    path: 'features/authentication.md',
    title: 'Authentication Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Authentication Flow' },
      { title: 'JWT Implementation', codeExample: true },
      { title: 'OAuth2 Integration', codeExample: true },
      { title: 'Social Auth' },
      { title: 'Security Considerations' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  {
    path: 'features/authorization.md',
    title: 'Authorization Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Role-Based Access Control' },
      { title: 'Permission System', codeExample: true },
      { title: 'Policy Enforcement', codeExample: true },
      { title: 'Audit Logging' },
      { title: 'Security Considerations' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  // Quality & Performance
  {
    path: 'quality/qa.md',
    title: 'Quality Assurance Guide',
    sections: [
      { title: 'Overview' },
      { title: 'QA Process' },
      { title: 'Testing Strategy' },
      { title: 'Automation', codeExample: true },
      { title: 'Performance Testing' },
      { title: 'Security Testing' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  },
  {
    path: 'quality/performance.md',
    title: 'Performance Optimization Guide',
    sections: [
      { title: 'Overview' },
      { title: 'Performance Metrics' },
      { title: 'Frontend Optimization', codeExample: true },
      { title: 'Backend Optimization', codeExample: true },
      { title: 'Database Optimization' },
      { title: 'Caching Strategy' },
      { title: 'Configuration' },
      { title: 'Related Guides' }
    ]
  }
];

function generateGuideContent(guide: GuideStructure): string {
  let content = `# ${guide.title}\n\n`;

  for (const section of guide.sections) {
    content += `## ${section.title}\n\n`;
    
    if (section.subsections) {
      for (const subsection of section.subsections) {
        content += `### ${subsection}\n\n`;
      }
    }

    if (section.codeExample) {
      content += '```typescript\n// Add implementation details here\n```\n\n';
    }
  }

  return content;
}

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function generateGuides() {
  const baseDir = 'docs/guides';

  for (const guide of guides) {
    const filePath = path.join(baseDir, guide.path);
    ensureDirectoryExists(filePath);
    
    const content = generateGuideContent(guide);
    fs.writeFileSync(filePath, content);
    
    console.log(`Generated guide: ${guide.path}`);
  }
}

generateGuides(); 