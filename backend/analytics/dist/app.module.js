"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const microservices_1 = require("@nestjs/microservices");
const analytics_module_1 = require("./analytics/analytics.module");
const metrics_module_1 = require("./metrics/metrics.module");
const reporting_module_1 = require("./reporting/reporting.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const health_module_1 = require("./health/health.module");
const logger_module_1 = require("./logger/logger.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const security_module_1 = require("./security/security.module");
const prisma_service_1 = require("./prisma/prisma.service");
const content_service_1 = require("./services/content.service");
const content_controller_1 = require("./controllers/content.controller");
const social_service_1 = require("./services/social.service");
const social_controller_1 = require("./controllers/social.controller");
const search_service_1 = require("./services/search.service");
const search_controller_1 = require("./controllers/search.controller");
const notification_service_1 = require("./services/notification.service");
const notification_controller_1 = require("./controllers/notification.controller");
const metrics_service_1 = require("./services/metrics.service");
const metrics_controller_1 = require("./controllers/metrics.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env']
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') !== 'production'
                }),
                inject: [config_1.ConfigService]
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloFederationDriver,
                autoSchemaFile: true,
                playground: true
            }),
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'RABBITMQ_SERVICE',
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => ({
                        transport: microservices_1.Transport.RMQ,
                        options: {
                            urls: [configService.get('RABBITMQ_URL')],
                            queue: 'analytics_queue',
                            queueOptions: {
                                durable: true
                            }
                        }
                    }),
                    inject: [config_1.ConfigService]
                }
            ]),
            analytics_module_1.AnalyticsModule,
            metrics_module_1.MetricsModule,
            reporting_module_1.ReportingModule,
            dashboard_module_1.DashboardModule,
            health_module_1.HealthModule,
            logger_module_1.LoggerModule,
            event_emitter_1.EventEmitterModule.forRoot(),
            security_module_1.SecurityModule,
        ],
        controllers: [
            content_controller_1.ContentController,
            social_controller_1.SocialController,
            search_controller_1.SearchController,
            notification_controller_1.NotificationController,
            metrics_controller_1.MetricsController
        ],
        providers: [
            prisma_service_1.PrismaService,
            content_service_1.ContentService,
            social_service_1.SocialService,
            search_service_1.SearchService,
            notification_service_1.NotificationService,
            metrics_service_1.MetricsService
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map