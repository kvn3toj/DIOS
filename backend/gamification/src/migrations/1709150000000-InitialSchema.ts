import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1709150000000 implements MigrationInterface {
  name = 'InitialSchema1709150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED')
    `);

    await queryRunner.query(`
      CREATE TYPE "achievement_type_enum" AS ENUM (
        'MILESTONE', 'COLLECTION', 'SKILL', 'SOCIAL', 'SPECIAL'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "achievement_rarity_enum" AS ENUM (
        'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "quest_type_enum" AS ENUM (
        'DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL', 'STORY', 'EVENT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "quest_difficulty_enum" AS ENUM (
        'EASY', 'MEDIUM', 'HARD', 'EXPERT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "progress_status_enum" AS ENUM (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "quest_progress_status_enum" AS ENUM (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED'
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "external_id" varchar NOT NULL,
        "username" varchar(100) NOT NULL,
        "level" integer NOT NULL DEFAULT 1,
        "experience" integer NOT NULL DEFAULT 0,
        "total_points" integer NOT NULL DEFAULT 0,
        "status" user_status_enum NOT NULL DEFAULT 'ACTIVE',
        "preferences" jsonb NOT NULL DEFAULT '{}',
        "stats" jsonb NOT NULL DEFAULT '{}',
        "avatar" varchar(255),
        "last_active" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create achievements table
    await queryRunner.query(`
      CREATE TABLE "achievements" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "type" achievement_type_enum NOT NULL DEFAULT 'MILESTONE',
        "rarity" achievement_rarity_enum NOT NULL DEFAULT 'COMMON',
        "points" integer NOT NULL DEFAULT 0,
        "criteria" jsonb,
        "rewards" jsonb,
        "icon" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "is_secret" boolean NOT NULL DEFAULT false,
        "required_level" integer NOT NULL DEFAULT 1,
        "available_until" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create achievement_progress table
    await queryRunner.query(`
      CREATE TABLE "achievement_progress" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "achievement_id" uuid NOT NULL,
        "status" progress_status_enum NOT NULL DEFAULT 'NOT_STARTED',
        "progress" float NOT NULL DEFAULT 0,
        "current_value" jsonb,
        "metadata" jsonb,
        "completed_at" timestamp,
        "last_updated" timestamp,
        "rewards_collected" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "unique_user_achievement" UNIQUE ("user_id", "achievement_id"),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("achievement_id") REFERENCES "achievements" ("id") ON DELETE CASCADE
      )
    `);

    // Create quests table
    await queryRunner.query(`
      CREATE TABLE "quests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "type" quest_type_enum NOT NULL DEFAULT 'DAILY',
        "difficulty" quest_difficulty_enum NOT NULL DEFAULT 'EASY',
        "experience_reward" integer NOT NULL DEFAULT 0,
        "points_reward" integer NOT NULL DEFAULT 0,
        "additional_rewards" jsonb,
        "objectives" jsonb NOT NULL,
        "icon" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "required_level" integer NOT NULL DEFAULT 1,
        "prerequisites" jsonb,
        "start_date" timestamp,
        "end_date" timestamp,
        "time_limit" interval,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create quest_progress table
    await queryRunner.query(`
      CREATE TABLE "quest_progress" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "quest_id" uuid NOT NULL,
        "status" quest_progress_status_enum NOT NULL DEFAULT 'NOT_STARTED',
        "objective_progress" jsonb NOT NULL DEFAULT '[]',
        "started_at" timestamp,
        "completed_at" timestamp,
        "expires_at" timestamp,
        "rewards_collected" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "unique_user_quest" UNIQUE ("user_id", "quest_id"),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("quest_id") REFERENCES "quests" ("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_users_external_id" ON "users" ("external_id");
      CREATE INDEX "idx_achievements_name" ON "achievements" ("name");
      CREATE INDEX "idx_achievement_progress_user_id" ON "achievement_progress" ("user_id");
      CREATE INDEX "idx_achievement_progress_achievement_id" ON "achievement_progress" ("achievement_id");
      CREATE INDEX "idx_quests_name" ON "quests" ("name");
      CREATE INDEX "idx_quest_progress_user_id" ON "quest_progress" ("user_id");
      CREATE INDEX "idx_quest_progress_quest_id" ON "quest_progress" ("quest_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.query('DROP TABLE IF EXISTS "quest_progress"');
    await queryRunner.query('DROP TABLE IF EXISTS "quests"');
    await queryRunner.query('DROP TABLE IF EXISTS "achievement_progress"');
    await queryRunner.query('DROP TABLE IF EXISTS "achievements"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');

    // Drop enum types
    await queryRunner.query('DROP TYPE IF EXISTS "quest_progress_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "progress_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "quest_difficulty_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "quest_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "achievement_rarity_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "achievement_type_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "user_status_enum"');
  }
} 