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
var DatabaseInitService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInitService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("typeorm");
const database_monitoring_service_1 = require("../../monitoring/services/database-monitoring.service");
let DatabaseInitService = DatabaseInitService_1 = class DatabaseInitService {
    constructor(configService, eventEmitter, databaseMonitoringService) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.databaseMonitoringService = databaseMonitoringService;
        this.logger = new common_1.Logger(DatabaseInitService_1.name);
    }
    async onModuleInit() {
        await this.initializeDatabase();
        this.startHealthCheck();
    }
    async onModuleDestroy() {
        await this.closeDatabase();
    }
    async initializeDatabase() {
        try {
            const dbConfig = this.getDatabaseConfig();
            this.connection = await (0, typeorm_1.createConnection)({
                ...dbConfig,
                entities: ['dist/**/*.entity{.ts,.js}'],
                migrations: ['dist/migrations/*{.ts,.js}'],
                subscribers: ['dist/subscribers/*{.ts,.js}'],
            });
            if (process.env.NODE_ENV !== 'production') {
                await this.connection.runMigrations();
                this.logger.log('Database migrations completed');
            }
            await this.initializeConnectionPool();
            this.logger.log('Database initialized successfully');
            this.eventEmitter.emit('database.ready', {
                timestamp: new Date(),
                connectionName: this.connection.name,
                isConnected: this.connection.isConnected,
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize database', error);
            throw error;
        }
    }
    getDatabaseConfig() {
        return {
            type: this.configService.get('database.type') || 'postgres',
            host: this.configService.get('database.host') || 'localhost',
            port: this.configService.get('database.port') || 5432,
            username: this.configService.get('database.username') || 'postgres',
            password: this.configService.get('database.password') || 'postgres',
            database: this.configService.get('database.database') || 'superapp',
            synchronize: this.configService.get('database.synchronize') || false,
            logging: this.configService.get('database.logging') || false,
            poolSize: this.configService.get('database.pool.max') || 10,
            connectTimeoutMS: this.configService.get('database.timeout.connect') || 10000,
            extra: {
                max: this.configService.get('database.pool.max') || 10,
                idleTimeoutMillis: this.configService.get('database.timeout.idle') || 30000,
                connectionTimeoutMillis: this.configService.get('database.timeout.connect') || 10000,
            },
        };
    }
    async initializeConnectionPool() {
        const poolConfig = {
            min: this.configService.get('database.pool.min') || 2,
            max: this.configService.get('database.pool.max') || 10,
        };
        if (this.connection.driver.isConnected) {
            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.query(`ALTER SYSTEM SET max_connections = ${poolConfig.max * 2}`);
            await queryRunner.query('SELECT pg_reload_conf()');
            await queryRunner.release();
        }
    }
    startHealthCheck() {
        const healthCheckInterval = this.configService.get('database.healthCheck.interval') || 30000;
        this.healthCheckInterval = setInterval(async () => {
            try {
                if (this.connection && this.connection.isConnected) {
                    await this.connection.query('SELECT 1');
                }
                else {
                    this.logger.warn('Database connection lost, attempting to reconnect...');
                    await this.reconnect();
                }
            }
            catch (error) {
                this.logger.error('Database health check failed', error);
                await this.reconnect();
            }
        }, healthCheckInterval);
    }
    async reconnect() {
        try {
            if (this.connection) {
                await this.connection.close();
            }
            await this.initializeDatabase();
            this.logger.log('Database reconnected successfully');
        }
        catch (error) {
            this.logger.error('Failed to reconnect to database', error);
            this.eventEmitter.emit('database.error', {
                timestamp: new Date(),
                error: error.message,
            });
        }
    }
    async closeDatabase() {
        try {
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }
            if (this.connection && this.connection.isConnected) {
                await this.connection.close();
                this.logger.log('Database connection closed');
            }
        }
        catch (error) {
            this.logger.error('Error closing database connection', error);
        }
    }
    async getConnection() {
        if (!this.connection || !this.connection.isConnected) {
            await this.reconnect();
        }
        return this.connection;
    }
    async checkConnection() {
        try {
            if (!this.connection || !this.connection.isConnected) {
                return false;
            }
            await this.connection.query('SELECT 1');
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.DatabaseInitService = DatabaseInitService;
exports.DatabaseInitService = DatabaseInitService = DatabaseInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object, database_monitoring_service_1.DatabaseMonitoringService])
], DatabaseInitService);
//# sourceMappingURL=database-init.service.js.map