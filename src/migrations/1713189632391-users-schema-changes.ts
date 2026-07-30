import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersSchemaChanges1713189632391 implements MigrationInterface {
    name = 'UsersSchemaChanges1713189632391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "email_verified_at"`);
        await queryRunner.query(`ALTER TABLE "User" ADD "telegramId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "UQ_bf7af6a24ad3c6e80adb75cf03a" UNIQUE ("telegramId")`);
        await queryRunner.query(`ALTER TABLE "User" ADD "username" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "phoneNo" character varying`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "UQ_423823b23d072b7bc6c2dd3eb85" UNIQUE ("phoneNo")`);
        await queryRunner.query(`ALTER TABLE "User" ADD "profilePicture" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "profilePicture"`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "UQ_423823b23d072b7bc6c2dd3eb85"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "phoneNo"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "UQ_bf7af6a24ad3c6e80adb75cf03a"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "telegramId"`);
        await queryRunner.query(`ALTER TABLE "User" ADD "email_verified_at" TIMESTAMP NOT NULL`);
    }

}
