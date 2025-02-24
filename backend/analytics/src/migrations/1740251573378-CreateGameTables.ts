import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGameTables1740251573378 implements MigrationInterface {
    name = 'CreateGameTables1740251573378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."achievements_type_enum" AS ENUM('DAILY', 'WEEKLY', 'SPECIAL', 'MILESTONE')`);
        await queryRunner.query(`CREATE TABLE "achievements" ("id" uuid NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "points" integer NOT NULL, "type" "public"."achievements_type_enum" NOT NULL, "criteria" jsonb NOT NULL, "reward" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."quests_type_enum" AS ENUM('DAILY', 'WEEKLY', 'SPECIAL', 'CHAIN')`);
        await queryRunner.query(`CREATE TABLE "quests" ("id" uuid NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "type" "public"."quests_type_enum" NOT NULL, "requirements" jsonb NOT NULL, "reward" jsonb NOT NULL, "deadline" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a037497017b64f530fe09c75364" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "quests"`);
        await queryRunner.query(`DROP TYPE "public"."quests_type_enum"`);
        await queryRunner.query(`DROP TABLE "achievements"`);
        await queryRunner.query(`DROP TYPE "public"."achievements_type_enum"`);
    }

}
