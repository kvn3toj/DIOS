"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersioningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const api_version_entity_1 = require("./entities/api-version.entity");
const semver = require("semver");
let ApiVersioningService = class ApiVersioningService {
    constructor(apiVersionRepository) {
        this.apiVersionRepository = apiVersionRepository;
    }
    async createVersion(version, path, supportedFeatures, compatibility) {
        if (!semver.valid(version)) {
            throw new common_1.BadRequestException('Invalid version format. Please use semantic versioning (e.g., 1.0.0)');
        }
        const existingVersion = await this.apiVersionRepository.findOne({ where: { version } });
        if (existingVersion) {
            throw new common_1.BadRequestException(`Version ${version} already exists`);
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
    async deprecateVersion(version, deprecationPolicy) {
        const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
        if (!apiVersion) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        if (apiVersion.status === api_version_entity_1.VersionStatus.SUNSET) {
            throw new common_1.BadRequestException(`Version ${version} is already sunset`);
        }
        apiVersion.status = api_version_entity_1.VersionStatus.DEPRECATED;
        apiVersion.deprecationPolicy = deprecationPolicy;
        return this.apiVersionRepository.save(apiVersion);
    }
    async sunsetVersion(version) {
        const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
        if (!apiVersion) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        if (apiVersion.status !== api_version_entity_1.VersionStatus.DEPRECATED) {
            throw new common_1.BadRequestException(`Version ${version} must be deprecated before sunsetting`);
        }
        apiVersion.status = api_version_entity_1.VersionStatus.SUNSET;
        return this.apiVersionRepository.save(apiVersion);
    }
    async updateMetrics(version, metrics) {
        const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
        if (!apiVersion) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        apiVersion.metrics = {
            ...apiVersion.metrics,
            ...metrics,
            lastUpdated: new Date()
        };
        return this.apiVersionRepository.save(apiVersion);
    }
    async addBreakingChange(version, change) {
        const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
        if (!apiVersion) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        const breakingChanges = apiVersion.compatibility?.breakingChanges || [];
        apiVersion.compatibility = {
            ...apiVersion.compatibility,
            breakingChanges: [...breakingChanges, change]
        };
        return this.apiVersionRepository.save(apiVersion);
    }
    async updateDocumentation(version, documentation) {
        const apiVersion = await this.apiVersionRepository.findOne({ where: { version } });
        if (!apiVersion) {
            throw new common_1.NotFoundException(`Version ${version} not found`);
        }
        apiVersion.documentation = {
            ...apiVersion.documentation,
            ...documentation
        };
        return this.apiVersionRepository.save(apiVersion);
    }
    async getActiveVersions() {
        return this.apiVersionRepository.find({
            where: [
                { status: api_version_entity_1.VersionStatus.CURRENT },
                { status: api_version_entity_1.VersionStatus.DEPRECATED }
            ],
            order: {
                version: 'DESC'
            }
        });
    }
    async validateClientVersion(clientVersion) {
        const activeVersions = await this.getActiveVersions();
        for (const version of activeVersions) {
            const { minClientVersion, maxClientVersion } = version.compatibility;
            if (semver.gte(clientVersion, minClientVersion) &&
                semver.lte(clientVersion, maxClientVersion)) {
                return { compatible: true };
            }
        }
        const recommendedVersion = activeVersions.find(v => v.status === api_version_entity_1.VersionStatus.CURRENT);
        return {
            compatible: false,
            recommendedVersion: recommendedVersion?.version,
            migrationGuide: recommendedVersion?.documentation?.migrationGuides[0]
        };
    }
};
exports.ApiVersioningService = ApiVersioningService;
exports.ApiVersioningService = ApiVersioningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_version_entity_1.ApiVersion)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApiVersioningService);
//# sourceMappingURL=api-versioning.service.js.map