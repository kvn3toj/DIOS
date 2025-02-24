import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateGameTables1740251573378 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
