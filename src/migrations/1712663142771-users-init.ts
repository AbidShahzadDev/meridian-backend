import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersInit1712663142771 implements MigrationInterface {
    name = 'UsersInit1712663142771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Tier" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "time" integer NOT NULL, "points" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), CONSTRAINT "UQ_00dfef75348b85d047bf25e3ef6" UNIQUE ("name"), CONSTRAINT "PK_e2b8e2992286bc22bce84c250f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "LeaderBoard" ("id" SERIAL NOT NULL, "position" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "tierId" integer, CONSTRAINT "PK_0bd790684efdb220d5488975d6c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "LeaderBoard" ADD CONSTRAINT "FK_0e7a33c250689382c761af26716" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "LeaderBoard" DROP CONSTRAINT "FK_0e7a33c250689382c761af26716"`);
        await queryRunner.query(`DROP TABLE "LeaderBoard"`);
        await queryRunner.query(`DROP TABLE "Tier"`);
    }

}
