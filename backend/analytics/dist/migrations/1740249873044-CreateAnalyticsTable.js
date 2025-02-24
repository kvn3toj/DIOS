"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAnalyticsTable1740249873044 = void 0;
class CreateAnalyticsTable1740249873044 {
    constructor() {
        this.name = 'CreateAnalyticsTable1740249873044';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."analytics_type_enum" AS ENUM('USER', 'SYSTEM', 'GAME', 'ACHIEVEMENT', 'QUEST', 'SOCIAL', 'PERFORMANCE')`);
        await queryRunner.query(`CREATE TYPE "public"."analytics_category_enum" AS ENUM('ACTION', 'EVENT', 'METRIC', 'ERROR', 'AUDIT')`);
        await queryRunner.query(`CREATE TABLE "analytics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."analytics_type_enum" NOT NULL, "category" "public"."analytics_category_enum" NOT NULL, "event" character varying NOT NULL, "userId" character varying, "sessionId" character varying, "deviceId" character varying, "source" character varying, "platform" character varying, "version" character varying, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb, "context" jsonb, "customData" jsonb, "data" jsonb, "metrics" jsonb, "session" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3c96dcbf1e4c57ea9e0c3144bff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a150437ec0be6ce6aaad3f374e" ON "analytics" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e536ace05b3ada403b32fa6d95" ON "analytics" ("timestamp") `);
        await queryRunner.query(`CREATE INDEX "IDX_17c77e753c0dc42bac3576ff8d" ON "analytics" ("type", "category") `);
        await queryRunner.query(`CREATE TABLE "database_metric" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "activeConnections" integer NOT NULL, "idleConnections" integer NOT NULL, "maxConnections" integer NOT NULL, "connectionUtilization" double precision NOT NULL, "waitingQueries" integer NOT NULL, "avgQueryTime" double precision NOT NULL, "slowQueries" integer NOT NULL, "deadlocks" integer NOT NULL, "rollbacks" integer NOT NULL, "transactions" jsonb NOT NULL, "cacheHitRatio" double precision NOT NULL, "indexHitRatio" double precision NOT NULL, "bufferCacheHitRatio" double precision NOT NULL, "sharedBufferUsage" double precision NOT NULL, "tableStats" jsonb NOT NULL, "vacuumStats" jsonb NOT NULL, "metadata" jsonb, CONSTRAINT "PK_c188d36aa22401445498f3ef624" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1589ffe10990f33f16c3d088fa" ON "database_metric" ("timestamp") `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_1589ffe10990f33f16c3d088fa"`);
        await queryRunner.query(`DROP TABLE "database_metric"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_17c77e753c0dc42bac3576ff8d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e536ace05b3ada403b32fa6d95"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a150437ec0be6ce6aaad3f374e"`);
        await queryRunner.query(`DROP TABLE "analytics"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."analytics_type_enum"`);
    }
}
exports.CreateAnalyticsTable1740249873044 = CreateAnalyticsTable1740249873044;
//# sourceMappingURL=1740249873044-CreateAnalyticsTable.js.map