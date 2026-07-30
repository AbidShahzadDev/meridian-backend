import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersSchemaChanges1718028325413 implements MigrationInterface {
    name = 'UsersSchemaChanges1718028325413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Tier" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "time" integer NOT NULL, "points" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_00dfef75348b85d047bf25e3ef6" UNIQUE ("name"), CONSTRAINT "PK_e2b8e2992286bc22bce84c250f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "LeaderBoard" ("id" SERIAL NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "tierId" integer, CONSTRAINT "PK_0bd790684efdb220d5488975d6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "telegramId" character varying NOT NULL, "username" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNo" character varying, "profilePicture" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_bf7af6a24ad3c6e80adb75cf03a" UNIQUE ("telegramId"), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "UQ_423823b23d072b7bc6c2dd3eb85" UNIQUE ("phoneNo"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "LeaderBoard" ADD CONSTRAINT "FK_0e7a33c250689382c761af26716" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "LeaderBoard" DROP CONSTRAINT "FK_0e7a33c250689382c761af26716"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "LeaderBoard"`);
        await queryRunner.query(`DROP TABLE "Tier"`);
    }

}
