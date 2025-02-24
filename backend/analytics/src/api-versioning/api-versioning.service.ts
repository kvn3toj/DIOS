import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiVersion, VersionStatus } from './entities/api-version.entity';
import * as semver from 'semver';

@Injectable()
export class ApiVersioningService {
  constructor(
    @InjectRepository(ApiVersion)
    private apiVersionRepository: Repository<ApiVersion>
  ) {}

  async createVersion(
    version: string,
    path: string,
    supportedFeatures: string[],
    compatibility: ApiVersion['compatibility']
  ): Promise<ApiVersion> {
    if (!semver.valid(version)) {
      throw new BadRequestException('Invalid version format. Please use semantic versioning (e.g., 1.0.0)');
    }

    const existingVersion = await this.apiVersionRepository.findOne({ where: { version } });
    if (existingVersion) {
      throw new BadRequestException(`Version ${version} already exists`);
    }

    const apiVersion = this.apiVersionRepository.create({
      version,
      path,
      supportedFeatures,
      compatibility,
      metrics: {
        activeClients: 0,
        requestCount: 0,
        errorRate: 0,
        lastUpdated: new Date()
      }
    });

    return this.apiVersionRepository.save(apiVersion);
  }

  async deprecateVersion(
    version: string,
    deprecationPolicy: ApiVersion['deprecationPolicy']
  ): Promise<ApiVersion> {
    const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
    if (!apiVersion) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    if (apiVersion.status === VersionStatus.SUNSET) {
      throw new BadRequestException(`Version ${version} is already sunset`);
    }

    apiVersion.status = VersionStatus.DEPRECATED;
    apiVersion.deprecationPolicy = deprecationPolicy;

    return this.apiVersionRepository.save(apiVersion);
  }

  async sunsetVersion(version: string): Promise<ApiVersion> {
    const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
    if (!apiVersion) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    if (apiVersion.status !== VersionStatus.DEPRECATED) {
      throw new BadRequestException(`Version ${version} must be deprecated before sunsetting`);
    }

    apiVersion.status = VersionStatus.SUNSET;
    return this.apiVersionRepository.save(apiVersion);
  }

  async updateMetrics(version: string, metrics: Partial<ApiVersion['metrics']>): Promise<ApiVersion> {
    const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
    if (!apiVersion) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    apiVersion.metrics = {
      ...apiVersion.metrics,
      ...metrics,
      lastUpdated: new Date()
    };

    return this.apiVersionRepository.save(apiVersion);
  }

  async addBreakingChange(
    version: string,
    change: {
      description: string;
      affectedEndpoints: string[];
      migrationGuide: string;
    }
  ): Promise<ApiVersion> {
    const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
    if (!apiVersion) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    const breakingChanges = apiVersion.compatibility?.breakingChanges || [];
    apiVersion.compatibility = {
      ...apiVersion.compatibility,
      breakingChanges: [...breakingChanges, change]
    };

    return this.apiVersionRepository.save(apiVersion);
  }

  async updateDocumentation(
    version: string,
    documentation: Partial<ApiVersion['documentation']>
  ): Promise<ApiVersion> {
    const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
    if (!apiVersion) {
      throw new NotFoundException(`Version ${version} not found`);
    }

    apiVersion.documentation = {
      ...apiVersion.documentation,
      ...documentation
    };

    return this.apiVersionRepository.save(apiVersion);
  }

  async getActiveVersions(): Promise<ApiVersion[]> {
    return this.apiVersionRepository.find({
      where: [
        { status: VersionStatus.CURRENT },
        { status: VersionStatus.DEPRECATED }
      ],
      order: {
        version: 'DESC'
      }
    });
  }

  async validateClientVersion(clientVersion: string): Promise<{
    compatible: boolean;
    recommendedVersion?: string;
    migrationGuide?: string;
  }> {
    const activeVersions = await this.getActiveVersions();
    
    for (const version of activeVersions) {
      const { minClientVersion, maxClientVersion } = version.compatibility;
      
      if (
        semver.gte(clientVersion, minClientVersion) &&
        semver.lte(clientVersion, maxClientVersion)
      ) {
        return { compatible: true };
      }
    }

    // Find the newest version that the client should upgrade to
    const recommendedVersion = activeVersions.find(v => v.status === VersionStatus.CURRENT);
    
    return {
      compatible: false,
      recommendedVersion: recommendedVersion?.version,
      migrationGuide: recommendedVersion?.documentation?.migrationGuides[0]
    };
  }
} 