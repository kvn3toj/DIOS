import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSocialEntities1709123456789 implements MigrationInterface {
  name = 'CreateSocialEntities1709123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "connection_status_enum" AS ENUM (
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'BLOCKED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "activity_type_enum" AS ENUM (
        'POST',
        'COMMENT',
        'LIKE',
        'SHARE',
        'FOLLOW',
        'ACHIEVEMENT',
        'QUEST_COMPLETION',
        'REWARD_EARNED',
        'PROFILE_UPDATE',
        'CUSTOM'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "activity_visibility_enum" AS ENUM (
        'PUBLIC',
        'CONNECTIONS',
        'PRIVATE'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'FOLLOW',
        'LIKE',
        'COMMENT',
        'MENTION',
        'ACHIEVEMENT',
        'QUEST',
        'REWARD',
        'SYSTEM',
        'CUSTOM'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_priority_enum" AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'URGENT'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_status_enum" AS ENUM (
        'UNREAD',
        'READ',
        'ARCHIVED'
      )
    `);

    // Create Profile table
    await queryRunner.query(`
      CREATE TABLE "profile" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "bio" text,
        "avatarUrl" character varying,
        "interests" text[],
        "connectionCount" integer NOT NULL DEFAULT 0,
        "activityCount" integer NOT NULL DEFAULT 0,
        "isVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastSeenAt" TIMESTAMP,
        "settings" jsonb,
        "badges" text[],
        CONSTRAINT "PK_profile" PRIMARY KEY ("id")
      )
    `);

    // Create Connection table
    await queryRunner.query(`
      CREATE TABLE "connection" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "followerId" uuid NOT NULL,
        "followingId" uuid NOT NULL,
        "status" connection_status_enum NOT NULL DEFAULT 'PENDING',
        "note" character varying,
        "isFavorite" boolean NOT NULL DEFAULT false,
        "notificationsEnabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "acceptedAt" TIMESTAMP,
        "rejectedAt" TIMESTAMP,
        "blockedAt" TIMESTAMP,
        CONSTRAINT "PK_connection" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_connection_follower_following" UNIQUE ("followerId", "followingId")
      )
    `);

    // Create Activity table
    await queryRunner.query(`
      CREATE TABLE "activity" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "profileId" uuid NOT NULL,
        "type" activity_type_enum NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "visibility" activity_visibility_enum NOT NULL DEFAULT 'PUBLIC',
        "metadata" jsonb,
        "targetId" character varying,
        "targetType" character varying,
        "likesCount" integer NOT NULL DEFAULT 0,
        "commentsCount" integer NOT NULL DEFAULT 0,
        "sharesCount" integer NOT NULL DEFAULT 0,
        "isPinned" boolean NOT NULL DEFAULT false,
        "isArchived" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "scheduledAt" TIMESTAMP,
        "expiresAt" TIMESTAMP,
        CONSTRAINT "PK_activity" PRIMARY KEY ("id")
      )
    `);

    // Create Notification table
    await queryRunner.query(`
      CREATE TABLE "notification" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "profileId" uuid NOT NULL,
        "type" notification_type_enum NOT NULL,
        "priority" notification_priority_enum NOT NULL DEFAULT 'MEDIUM',
        "status" notification_status_enum NOT NULL DEFAULT 'UNREAD',
        "title" character varying NOT NULL,
        "message" text,
        "data" jsonb,
        "icon" character varying,
        "action" character varying,
        "actionUrl" character varying,
        "isActionable" boolean NOT NULL DEFAULT true,
        "isDismissible" boolean NOT NULL DEFAULT false,
        "isSticky" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "readAt" TIMESTAMP,
        "archivedAt" TIMESTAMP,
        "expiresAt" TIMESTAMP,
        CONSTRAINT "PK_notification" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_profile_userId" ON "profile" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_connection_followerId" ON "connection" ("followerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_connection_followingId" ON "connection" ("followingId")`);
    await queryRunner.query(`CREATE INDEX "IDX_activity_profileId_createdAt" ON "activity" ("profileId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_activity_type_createdAt" ON "activity" ("type", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_notification_profileId_createdAt" ON "notification" ("profileId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_notification_type_status" ON "notification" ("type", "status")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "connection"
      ADD CONSTRAINT "FK_connection_follower"
      FOREIGN KEY ("followerId")
      REFERENCES "profile"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "connection"
      ADD CONSTRAINT "FK_connection_following"
      FOREIGN KEY ("followingId")
      REFERENCES "profile"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "activity"
      ADD CONSTRAINT "FK_activity_profile"
      FOREIGN KEY ("profileId")
      REFERENCES "profile"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "notification"
      ADD CONSTRAINT "FK_notification_profile"
      FOREIGN KEY ("profileId")
      REFERENCES "profile"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_notification_profile"`);
    await queryRunner.query(`ALTER TABLE "activity" DROP CONSTRAINT "FK_activity_profile"`);
    await queryRunner.query(`ALTER TABLE "connection" DROP CONSTRAINT "FK_connection_following"`);
    await queryRunner.query(`ALTER TABLE "connection" DROP CONSTRAINT "FK_connection_follower"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_notification_type_status"`);
    await queryRunner.query(`DROP INDEX "IDX_notification_profileId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_activity_type_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_activity_profileId_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_connection_followingId"`);
    await queryRunner.query(`DROP INDEX "IDX_connection_followerId"`);
    await queryRunner.query(`DROP INDEX "IDX_profile_userId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "activity"`);
    await queryRunner.query(`DROP TABLE "connection"`);
    await queryRunner.query(`DROP TABLE "profile"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "notification_status_enum"`);
    await queryRunner.query(`DROP TYPE "notification_priority_enum"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "activity_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "activity_type_enum"`);
    await queryRunner.query(`DROP TYPE "connection_status_enum"`);
  }
} 