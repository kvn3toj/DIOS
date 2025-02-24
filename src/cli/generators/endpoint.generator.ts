import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';

export async function generateEndpoint(name: string): Promise<void> {
  const endpointDir = path.join(
    process.cwd(),
    'src',
    'endpoints',
    name.toLowerCase()
  );

  try {
    // Create endpoint directory
    await fs.ensureDir(endpointDir);

    // Generate endpoint files
    await generateControllerFile(name, endpointDir);
    await generateServiceFile(name, endpointDir);
    await generateDTOFile(name, endpointDir);
    await generateTestFile(name, endpointDir);

    console.log(
      chalk.green(`API endpoint ${name} created successfully at ${endpointDir}`)
    );
  } catch (error) {
    throw new Error(`Failed to generate endpoint: ${error.message}`);
  }
}

async function generateControllerFile(
  name: string,
  dir: string
): Promise<void> {
  const content = `import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';
import { Create${capitalizeFirst(name)}Dto } from './dto/create-${name.toLowerCase()}.dto';
import { Update${capitalizeFirst(name)}Dto } from './dto/update-${name.toLowerCase()}.dto';

@ApiTags('${name.toLowerCase()}')
@Controller('api/${name.toLowerCase()}')
@UseGuards(JwtAuthGuard)
export class ${capitalizeFirst(name)}Controller {
  constructor(private readonly ${name.toLowerCase()}Service: ${capitalizeFirst(name)}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ${name.toLowerCase()}' })
  @ApiResponse({ status: 201, description: '${capitalizeFirst(name)} created successfully' })
  create(@Body() create${capitalizeFirst(name)}Dto: Create${capitalizeFirst(name)}Dto) {
    return this.${name.toLowerCase()}Service.create(create${capitalizeFirst(name)}Dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ${name.toLowerCase()}s' })
  @ApiResponse({ status: 200, description: 'Return all ${name.toLowerCase()}s' })
  findAll() {
    return this.${name.toLowerCase()}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ${name.toLowerCase()} by id' })
  @ApiResponse({ status: 200, description: 'Return a ${name.toLowerCase()}' })
  findOne(@Param('id') id: string) {
    return this.${name.toLowerCase()}Service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ${name.toLowerCase()}' })
  @ApiResponse({ status: 200, description: '${capitalizeFirst(name)} updated successfully' })
  update(@Param('id') id: string, @Body() update${capitalizeFirst(name)}Dto: Update${capitalizeFirst(name)}Dto) {
    return this.${name.toLowerCase()}Service.update(id, update${capitalizeFirst(name)}Dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ${name.toLowerCase()}' })
  @ApiResponse({ status: 200, description: '${capitalizeFirst(name)} deleted successfully' })
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
  const content = `import { Injectable, NotFoundException } from '@nestjs/common';
import { Create${capitalizeFirst(name)}Dto } from './dto/create-${name.toLowerCase()}.dto';
import { Update${capitalizeFirst(name)}Dto } from './dto/update-${name.toLowerCase()}.dto';

@Injectable()
export class ${capitalizeFirst(name)}Service {
  private ${name.toLowerCase()}s = [];

  async create(create${capitalizeFirst(name)}Dto: Create${capitalizeFirst(name)}Dto) {
    const new${capitalizeFirst(name)} = {
      id: Date.now().toString(),
      ...create${capitalizeFirst(name)}Dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.${name.toLowerCase()}s.push(new${capitalizeFirst(name)});
    return new${capitalizeFirst(name)};
  }

  async findAll() {
    return this.${name.toLowerCase()}s;
  }

  async findOne(id: string) {
    const ${name.toLowerCase()} = this.${name.toLowerCase()}s.find(item => item.id === id);
    if (!${name.toLowerCase()}) {
      throw new NotFoundException('${capitalizeFirst(name)} not found');
    }
    return ${name.toLowerCase()};
  }

  async update(id: string, update${capitalizeFirst(name)}Dto: Update${capitalizeFirst(name)}Dto) {
    const index = this.${name.toLowerCase()}s.findIndex(item => item.id === id);
    if (index === -1) {
      throw new NotFoundException('${capitalizeFirst(name)} not found');
    }
    this.${name.toLowerCase()}s[index] = {
      ...this.${name.toLowerCase()}s[index],
      ...update${capitalizeFirst(name)}Dto,
      updatedAt: new Date(),
    };
    return this.${name.toLowerCase()}s[index];
  }

  async remove(id: string) {
    const index = this.${name.toLowerCase()}s.findIndex(item => item.id === id);
    if (index === -1) {
      throw new NotFoundException('${capitalizeFirst(name)} not found');
    }
    const deleted${capitalizeFirst(name)} = this.${name.toLowerCase()}s[index];
    this.${name.toLowerCase()}s.splice(index, 1);
    return deleted${capitalizeFirst(name)};
  }
}`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.service.ts`),
    content
  );
}

async function generateDTOFile(name: string, dir: string): Promise<void> {
  const dtoDir = path.join(dir, 'dto');
  await fs.ensureDir(dtoDir);

  const createDtoContent = `import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${capitalizeFirst(name)}Dto {
  @ApiProperty({ description: 'The name of the ${name.toLowerCase()}' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The description of the ${name.toLowerCase()}', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}`;

  const updateDtoContent = `import { PartialType } from '@nestjs/swagger';
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

async function generateTestFile(name: string, dir: string): Promise<void> {
  const testContent = `import { Test, TestingModule } from '@nestjs/testing';
import { ${capitalizeFirst(name)}Controller } from './${name.toLowerCase()}.controller';
import { ${capitalizeFirst(name)}Service } from './${name.toLowerCase()}.service';
import { Create${capitalizeFirst(name)}Dto } from './dto/create-${name.toLowerCase()}.dto';
import { Update${capitalizeFirst(name)}Dto } from './dto/update-${name.toLowerCase()}.dto';

describe('${capitalizeFirst(name)}Controller', () => {
  let controller: ${capitalizeFirst(name)}Controller;
  let service: ${capitalizeFirst(name)}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [${capitalizeFirst(name)}Controller],
      providers: [${capitalizeFirst(name)}Service],
    }).compile();

    controller = module.get<${capitalizeFirst(name)}Controller>(${capitalizeFirst(name)}Controller);
    service = module.get<${capitalizeFirst(name)}Service>(${capitalizeFirst(name)}Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ${name.toLowerCase()}', async () => {
      const dto: Create${capitalizeFirst(name)}Dto = {
        name: 'Test ${name}',
        description: 'Test Description',
      };
      const result = await controller.create(dto);
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(dto.name);
    });
  });

  describe('findAll', () => {
    it('should return an array of ${name.toLowerCase()}s', async () => {
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});`;

  await fs.writeFile(
    path.join(dir, `${name.toLowerCase()}.controller.spec.ts`),
    testContent
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
