import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';

export async function generateService(name: string): Promise<void> {
  const serviceDir = path.join(
    process.cwd(),
    'src',
    'services',
    name.toLowerCase()
  );

  try {
    // Create service directory
    await fs.ensureDir(serviceDir);

    // Generate service files
    await generateServiceFile(name, serviceDir);
    await generateInterfaceFile(name, serviceDir);
    await generateTestFile(name, serviceDir);

    console.log(
      chalk.green(`Service ${name} created successfully at ${serviceDir}`)
    );
  } catch (error) {
    throw new Error(`Failed to generate service: ${error.message}`);
  }
}

async function generateServiceFile(name: string, dir: string): Promise<void> {
  const content = `import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.interface';

@Injectable()
export class ${capitalizeFirst(name)}Service implements I${capitalizeFirst(name)}Service {
  private readonly logger = new Logger(${capitalizeFirst(name)}Service.name);

  constructor(private readonly configService: ConfigService) {}

  async initialize(): Promise<void> {
    try {
      this.logger.log('Initializing ${name} service...');
      // Add initialization logic here
      this.logger.log('${capitalizeFirst(name)} service initialized successfully');
    } catch (error) {
      this.logger.error(\`Failed to initialize ${name} service: \${error.message}\`);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Add health check logic here
      return true;
    } catch (error) {
      this.logger.error(\`Health check failed: \${error.message}\`);
      return false;
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.logger.log('Shutting down ${name} service...');
      // Add cleanup logic here
      this.logger.log('${capitalizeFirst(name)} service shut down successfully');
    } catch (error) {
      this.logger.error(\`Failed to shut down ${name} service: \${error.message}\`);
      throw error;
    }
  }
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.service.ts`),
    content
  );
}

async function generateInterfaceFile(name: string, dir: string): Promise<void> {
  const content = `export interface I${capitalizeFirst(name)}Service {
  /**
   * Initialize the service
   */
  initialize(): Promise<void>;

  /**
   * Perform a health check
   * @returns true if healthy, false otherwise
   */
  healthCheck(): Promise<boolean>;

  /**
   * Gracefully shutdown the service
   */
  shutdown(): Promise<void>;
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.interface.ts`),
    content
  );
}

async function generateTestFile(name: string, dir: string): Promise<void> {
  const testContent = `import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';

describe('${capitalizeFirst(name)}Service', () => {
  let service: ${capitalizeFirst(name)}Service;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${capitalizeFirst(name)}Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              // Add mock configuration values here
              return 'mock-value';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<${capitalizeFirst(name)}Service>(${capitalizeFirst(name)}Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return true when healthy', async () => {
      const result = await service.healthCheck();
      expect(result).toBe(true);
    });
  });

  describe('shutdown', () => {
    it('should shutdown successfully', async () => {
      await expect(service.shutdown()).resolves.not.toThrow();
    });
  });
});`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.service.spec.ts`),
    testContent
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
