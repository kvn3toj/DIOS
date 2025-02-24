"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
const Achievement_1 = require("../entities/Achievement");
const Quest_1 = require("../entities/Quest");
(0, dotenv_1.config)();
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'superapp',
    entities: [analytics_entity_1.AnalyticsEntity, Achievement_1.Achievement, Quest_1.Quest],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
});
//# sourceMappingURL=typeorm.config.js.map