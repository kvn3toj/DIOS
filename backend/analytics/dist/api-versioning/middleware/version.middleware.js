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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionMiddleware = void 0;
const common_1 = require("@nestjs/common");
const api_versioning_service_1 = require("../api-versioning.service");
let ApiVersionMiddleware = class ApiVersionMiddleware {
    constructor(versioningService) {
        this.versioningService = versioningService;
    }
    async use(req, res, next) {
        const clientVersion = req.headers['x-api-version'];
        if (!clientVersion) {
            throw new common_1.BadRequestException('API version header (x-api-version) is required');
        }
        const validation = await this.versioningService.validateClientVersion(clientVersion);
        if (!validation.compatible) {
            return res.status(426).json({
                error: 'Upgrade Required',
                message: 'Your client version is not compatible with the current API version',
                recommendedVersion: validation.recommendedVersion,
                migrationGuide: validation.migrationGuide
            });
        }
        req['apiVersion'] = {
            clientVersion,
            timestamp: new Date()
        };
        next();
    }
};
exports.ApiVersionMiddleware = ApiVersionMiddleware;
exports.ApiVersionMiddleware = ApiVersionMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_versioning_service_1.ApiVersioningService])
], ApiVersionMiddleware);
//# sourceMappingURL=version.middleware.js.map