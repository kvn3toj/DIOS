import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';

export async function generateComponent(name: string): Promise<void> {
  const componentDir = path.join(process.cwd(), 'src', name.toLowerCase());
  const templateDir = path.join(__dirname, '../templates');

  try {
    // Create component directory
    await fs.ensureDir(componentDir);

    // Generate component files
    await generateControllerFile(name, componentDir);
    await generateServiceFile(name, componentDir);
    await generateModuleFile(name, componentDir);
    await generateDTOFile(name, componentDir);
    await generateEntityFile(name, componentDir);
    await generateTestFiles(name, componentDir);

    console.log(
      chalk.green(`Component ${name} created successfully at ${componentDir}`)
    );
  } catch (error) {
    throw new Error(`Failed to generate component: ${error.message}`);
  }
}

async function generateControllerFile(
  name: string,
  dir: string
): Promise<void> {
  const content = `import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';
import { Create${capitalizeFirst(name)}Dto } from './dto/create-${name.toLowerCase()}.dto';
import { Update${capitalizeFirst(name)}Dto } from './dto/update-${name.toLowerCase()}.dto';

@Controller('${name.toLowerCase()}')
export class ${capitalizeFirst(name)}Controller {
  constructor(private readonly ${name.toLowerCase()}Service: ${capitalizeFirst(name)}Service) {}

  @Post()
  create(@Body() create${capitalizeFirst(name)}Dto: Create${capitalizeFirst(name)}Dto) {
    return this.${name.toLowerCase()}Service.create(create${capitalizeFirst(name)}Dto);
  }

  @Get()
  findAll() {
    return this.${name.toLowerCase()}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${name.toLowerCase()}Service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() update${capitalizeFirst(name)}Dto: Update${capitalizeFirst(name)}Dto) {
    return this.${name.toLowerCase()}Service.update(id, update${capitalizeFirst(name)}Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.${name.toLowerCase()}Service.remove(id);
  }
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.controller.ts`),
    content
  );
}

async function generateServiceFile(name: string, dir: string): Promise<void> {
  const content = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${capitalizeFirst(name)}Entity } from './${name.toLowerCase()}.entity';
import { Create${capitalizeFirst(name)}Dto } from './dto/create-${name.toLowerCase()}.dto';
import { Update${capitalizeFirst(name)}Dto } from './dto/update-${name.toLowerCase()}.dto';

@Injectable()
export class ${capitalizeFirst(name)}Service {
  constructor(
    @InjectRepository(${capitalizeFirst(name)}Entity)
    private readonly ${name.toLowerCase()}Repository: Repository<${capitalizeFirst(name)}Entity>,
  ) {}

  async create(create${capitalizeFirst(name)}Dto: Create${capitalizeFirst(name)}Dto) {
    const entity = this.${name.toLowerCase()}Repository.create(create${capitalizeFirst(name)}Dto);
    return await this.${name.toLowerCase()}Repository.save(entity);
  }

  async findAll() {
    return await this.${name.toLowerCase()}Repository.find();
  }

  async findOne(id: string) {
    return await this.${name.toLowerCase()}Repository.findOne({ where: { id } });
  }

  async update(id: string, update${capitalizeFirst(name)}Dto: Update${capitalizeFirst(name)}Dto) {
    await this.${name.toLowerCase()}Repository.update(id, update${capitalizeFirst(name)}Dto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    return await this.${name.toLowerCase()}Repository.remove(entity);
  }
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.service.ts`),
    content
  );
}

async function generateModuleFile(name: string, dir: string): Promise<void> {
  const content = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${capitalizeFirst(name)}Controller } from './${name.toLowerCase()}.controller';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';
import { ${capitalizeFirst(name)}Entity } from './${name.toLowerCase()}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${capitalizeFirst(name)}Entity])],
  controllers: [${capitalizeFirst(name)}Controller],
  providers: [${capitalizeFirst(name)}Service],
  exports: [${capitalizeFirst(name)}Service],
})
export class ${capitalizeFirst(name)}Module {}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.module.ts`),
    content
  );
}

async function generateDTOFile(name: string, dir: string): Promise<void> {
  const dtoDir = path.join(dir, 'dto');
  await fs.ensureDir(dtoDir);

  const createDtoContent = `import { IsNotEmpty, IsString } from 'class-validator';

export class Create${capitalizeFirst(name)}Dto {
  @IsNotEmpty()
  @IsString()
  name: string;
}`;

  const updateDtoContent = `import { PartialType } from '@nestjs/mapped-types';
import { Create${capitalizeFirst(name)}Dto } from './create-${name.toLowerCase()}.dto';

export class Update${capitalizeFirst(name)}Dto extends PartialType(Create${capitalizeFirst(name)}Dto) {}`;

  await fs.writeFile(
    path.join(dtoDir, `create-${name.toLowerCase()}.dto.ts`),
    createDtoContent
  );
  await fs.writeFile(
    path.join(dtoDir, `update-${name.toLowerCase()}.dto.ts`),
    updateDtoContent
  );
}

async function generateEntityFile(name: string, dir: string): Promise<void> {
  const content = `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('${name.toLowerCase()}')
export class ${capitalizeFirst(name)}Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.entity.ts`),
    content
  );
}

async function generateTestFiles(name: string, dir: string): Promise<void> {
  const controllerTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { ${capitalizeFirst(name)}Controller } from './${name.toLowerCase()}.controller';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';

describe('${capitalizeFirst(name)}Controller', () => {
  let controller: ${capitalizeFirst(name)}Controller;
  let service: ${capitalizeFirst(name)}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [${capitalizeFirst(name)}Controller],
      providers: [
        {
          provide: ${capitalizeFirst(name)}Service,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<${capitalizeFirst(name)}Controller>(${capitalizeFirst(name)}Controller);
    service = module.get<${capitalizeFirst(name)}Service>(${capitalizeFirst(name)}Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});`;

  const serviceTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';
import { ${capitalizeFirst(name)}Entity } from './${name.toLowerCase()}.entity';

describe('${capitalizeFirst(name)}Service', () => {
  let service: ${capitalizeFirst(name)}Service;
  let repository: Repository<${capitalizeFirst(name)}Entity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${capitalizeFirst(name)}Service,
        {
          provide: getRepositoryToken(${capitalizeFirst(name)}Entity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<${capitalizeFirst(name)}Service>(${capitalizeFirst(name)}Service);
    repository = module.get<Repository<${capitalizeFirst(name)}Entity>>(
      getRepositoryToken(${capitalizeFirst(name)}Entity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.controller.spec.ts`),
    controllerTestContent
  );
  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.service.spec.ts`),
    serviceTestContent
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
