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
exports.CustomLoggerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const winston = require("winston");
const Sentry = require("@sentry/node");
let CustomLoggerService = class CustomLoggerService {
    constructor(configService) {
        this.configService = configService;
        Sentry.init({
            dsn: this.configService.get('SENTRY_DSN'),
            environment: this.configService.get('NODE_ENV'),
            tracesSampleRate: 1.0,
        });
        this.logger = winston.createLogger({
            level: this.configService.get('LOG_LEVEL', 'info'),
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            defaultMeta: { service: 'analytics-service' },
            transports: [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880,
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880,
                    maxFiles: 5,
                }),
            ],
        });
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            }));
        }
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message, { trace, context });
        Sentry.captureException(new Error(message), {
            extra: {
                trace,
                context,
            },
        });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
    }
    logPerformance(operation, duration, metadata) {
        this.logger.info('Performance metric', {
            operation,
            duration,
            ...metadata,
        });
        const transaction = Sentry.startTransaction({
            op: operation,
            name: `PERF/${operation}`,
        });
        transaction.setMeasurement('duration_ms', duration);
        transaction.finish();
    }
    logBusinessEvent(event, data) {
        this.logger.info('Business event', {
            event,
            data,
        });
        Sentry.captureMessage(`BUSINESS/${event}`, {
            level: 'info',
            extra: data,
        });
    }
};
exports.CustomLoggerService = CustomLoggerService;
exports.CustomLoggerService = CustomLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CustomLoggerService);
//# sourceMappingURL=logger.service.js.map