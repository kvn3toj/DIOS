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
var SetupGuideController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupGuideController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const setup_guide_service_1 = require("../services/setup-guide.service");
const user_decorator_1 = require("../decorators/user.decorator");
let SetupGuideController = SetupGuideController_1 = class SetupGuideController {
    constructor(setupGuideService) {
        this.setupGuideService = setupGuideService;
        this.logger = new common_1.Logger(SetupGuideController_1.name);
    }
    async initializeSetup(userId) {
        try {
            const setupProgress = await this.setupGuideService.initializeSetup(userId);
            return {
                success: true,
                message: 'Setup initialized successfully',
                data: setupProgress,
            };
        }
        catch (error) {
            this.logger.error('Failed to initialize setup:', error);
            throw new common_1.HttpException('Failed to initialize setup', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async completeStep(userId, stepId, data) {
        try {
            const setupProgress = await this.setupGuideService.completeStep(userId, stepId, data);
            return {
                success: true,
                message: 'Step completed successfully',
                data: setupProgress,
            };
        }
        catch (error) {
            this.logger.error('Failed to complete step:', error);
            throw new common_1.HttpException(error.message || 'Failed to complete step', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async skipStep(userId, stepId) {
        try {
            const setupProgress = await this.setupGuideService.skipStep(userId, stepId);
            return {
                success: true,
                message: 'Step skipped successfully',
                data: setupProgress,
            };
        }
        catch (error) {
            this.logger.error('Failed to skip step:', error);
            throw new common_1.HttpException(error.message || 'Failed to skip step', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getProgress(userId) {
        try {
            const progress = await this.setupGuideService.getSetupProgress(userId);
            return {
                success: true,
                data: progress,
            };
        }
        catch (error) {
            this.logger.error('Failed to get setup progress:', error);
            throw new common_1.HttpException('Failed to get setup progress', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SetupGuideController = SetupGuideController;
__decorate([
    (0, common_1.Post)('initialize'),
    __param(0, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SetupGuideController.prototype, "initializeSetup", null);
__decorate([
    (0, common_1.Post)('complete/:stepId'),
    __param(0, (0, user_decorator_1.User)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SetupGuideController.prototype, "completeStep", null);
__decorate([
    (0, common_1.Post)('skip/:stepId'),
    __param(0, (0, user_decorator_1.User)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SetupGuideController.prototype, "skipStep", null);
__decorate([
    (0, common_1.Get)('progress'),
    __param(0, (0, user_decorator_1.User)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SetupGuideController.prototype, "getProgress", null);
exports.SetupGuideController = SetupGuideController = SetupGuideController_1 = __decorate([
    (0, common_1.Controller)('auth/setup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [setup_guide_service_1.SetupGuideService])
], SetupGuideController);
//# sourceMappingURL=setup-guide.controller.js.map