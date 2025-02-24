import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';

export async function generateEntity(name: string): Promise<void> {
  const entityDir = path.join(process.cwd(), 'src', 'entities');

  try {
    // Create entities directory if it doesn't exist
    await fs.ensureDir(entityDir);

    // Generate entity files
    await generateEntityFile(name, entityDir);
    await generateRepositoryFile(name, entityDir);
    await generateTestFile(name, entityDir);

    console.log(
      chalk.green(`Entity ${name} created successfully at ${entityDir}`)
    );
  } catch (error) {
    throw new Error(`Failed to generate entity: ${error.message}`);
  }
}

async function generateEntityFile(name: string, dir: string): Promise<void> {
  const content = `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('${name.toLowerCase()}s')
export class ${capitalizeFirst(name)}Entity {
  @ApiProperty({ description: 'The unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the ${name.toLowerCase()}' })
  @Column()
  name: string;

  @ApiProperty({ description: 'The description of the ${name.toLowerCase()}' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Active status of the ${name.toLowerCase()}' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete timestamp' })
  @DeleteDateColumn()
  deletedAt?: Date;
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.entity.ts`),
    content
  );
}

async function generateRepositoryFile(
  name: string,
  dir: string
): Promise<void> {
  const content = `import { EntityRepository, Repository } from 'typeorm';
import { ${capitalizeFirst(name)}Entity } from './${name.toLowerCase()}.entity';

@EntityRepository(${capitalizeFirst(name)}Entity)
export class ${capitalizeFirst(name)}Repository extends Repository<${capitalizeFirst(name)}Entity> {
  async findActive(): Promise<${capitalizeFirst(name)}Entity[]> {
    return this.find({ where: { isActive: true } });
  }

  async findOneActive(id: string): Promise<${capitalizeFirst(name)}Entity> {
    return this.findOne({ where: { id, isActive: true } });
  }

  async softDelete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  async restore(id: string): Promise<void> {
    await this.update(id, { isActive: true, deletedAt: null });
  }
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.repository.ts`),
    content
  );
}

async function generateTestFile(name: string, dir: string): Promise<void> {
  const testContent = `import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${capitalizeFirst(name)}Entity } from './${name.toLowerCase()}.entity';
import { ${capitalizeFirst(name)}Repository } from './${name.toLowerCase()}.repository';

describe('${capitalizeFirst(name)}Repository', () => {
  let repository: ${capitalizeFirst(name)}Repository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ${capitalizeFirst(name)}Repository,
        {
          provide: getRepositoryToken(${capitalizeFirst(name)}Entity),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<${capitalizeFirst(name)}Repository>(${capitalizeFirst(name)}Repository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findActive', () => {
    it('should return active ${name.toLowerCase()}s', async () => {
      const result = await repository.findActive();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOneActive', () => {
    it('should return one active ${name.toLowerCase()}', async () => {
      const id = 'test-id';
      const result = await repository.findOneActive(id);
      expect(result).toBeDefined();
    });
  });
});`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.repository.spec.ts`),
    testContent
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
