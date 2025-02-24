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
var ErrorTrackingService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const logger_service_1 = require("./logger.service");
const error_log_entity_1 = require("./entities/error-log.entity");
let ErrorTrackingService = ErrorTrackingService_1 = class ErrorTrackingService {
    constructor(errorLogRepository, customLogger, eventEmitter) {
        this.errorLogRepository = errorLogRepository;
        this.customLogger = customLogger;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(ErrorTrackingService_1.name);
        this.errorRateThreshold = {
            warning: 5,
            critical: 10
        };
        this.startErrorRateMonitoring();
    }
    startErrorRateMonitoring() {
        setInterval(() => {
            this.checkErrorRate().catch(err => this.logger.error('Error checking error rate:', err));
        }, 60000);
    }
    async trackError(error, context, metadata) {
        const errorLog = this.errorLogRepository.create({
            timestamp: new Date(),
            name: error.name,
            message: error.message,
            stack: error.stack,
            context: context || 'unknown',
            metadata: metadata || {},
            severity: this.determineSeverity(error),
            status: 'new'
        });
        await this.errorLogRepository.save(errorLog);
        this.eventEmitter.emit('error.tracked', errorLog);
        this.customLogger.error(error.message, error.stack, context);
        return errorLog;
    }
    determineSeverity(error) {
        if (error instanceof TypeError || error instanceof ReferenceError) {
            return 'high';
        }
        if (error instanceof SyntaxError) {
            return 'critical';
        }
        if (error.message.toLowerCase().includes('database') ||
            error.message.toLowerCase().includes('connection')) {
            return 'critical';
        }
        return 'medium';
    }
    async getErrors(timeRange, context) {
        const query = this.errorLogRepository.createQueryBuilder('error');
        if (timeRange) {
            query.where('error.timestamp BETWEEN :start AND :end', {
                start: timeRange.start,
                end: timeRange.end
            });
        }
        if (context) {
            query.andWhere('error.context = :context', { context });
        }
        return query.orderBy('error.timestamp', 'DESC').getMany();
    }
    async getErrorAnalytics(timeRange) {
        const errors = await this.getErrors(timeRange);
        const analytics = {
            totalErrors: errors.length,
            errorsBySeverity: this.groupBySeverity(errors),
            errorsByContext: this.groupByContext(errors),
            topErrors: this.getTopErrors(errors),
            errorRate: this.calculateErrorRate(errors, timeRange),
            timeRange
        };
        return analytics;
    }
    groupBySeverity(errors) {
        return errors.reduce((acc, error) => {
            acc[error.severity] = (acc[error.severity] || 0) + 1;
            return acc;
        }, {});
    }
    groupByContext(errors) {
        return errors.reduce((acc, error) => {
            acc[error.context] = (acc[error.context] || 0) + 1;
            return acc;
        }, {});
    }
    getTopErrors(errors) {
        const errorCount = errors.reduce((acc, error) => {
            const key = `${error.name}: ${error.message}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(errorCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));
    }
    calculateErrorRate(errors, timeRange) {
        const timeSpanMinutes = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60);
        return errors.length / timeSpanMinutes;
    }
    async checkErrorRate() {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60000);
        const recentErrors = await this.errorLogRepository.count({
            where: {
                timestamp: (0, typeorm_2.Between)(oneMinuteAgo, now)
            }
        });
        const errorRate = recentErrors;
        if (errorRate >= this.errorRateThreshold.critical) {
            this.eventEmitter.emit('error.rate.critical', {
                rate: errorRate,
                threshold: this.errorRateThreshold.critical,
                timestamp: now
            });
        }
        else if (errorRate >= this.errorRateThreshold.warning) {
            this.eventEmitter.emit('error.rate.warning', {
                rate: errorRate,
                threshold: this.errorRateThreshold.warning,
                timestamp: now
            });
        }
        return errorRate;
    }
};
exports.ErrorTrackingService = ErrorTrackingService;
exports.ErrorTrackingService = ErrorTrackingService = ErrorTrackingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(error_log_entity_1.ErrorLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        logger_service_1.CustomLoggerService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], ErrorTrackingService);
//# sourceMappingURL=error-tracking.service.js.map