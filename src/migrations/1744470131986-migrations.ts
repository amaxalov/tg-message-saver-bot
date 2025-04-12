import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744470131986 implements MigrationInterface {
  name = 'Migrations1744470131986'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "message" ("id" SERIAL NOT NULL, "messageId" character varying NOT NULL, "text" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "assets" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "telegramId" character varying NOT NULL, "registrationDate" TIMESTAMP NOT NULL, "trialPeriodEnd" TIMESTAMP, "subscriptionEndDate" TIMESTAMP, "subscriptionStartDate" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_446251f8ceb2132af01b68eb593"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TABLE "message"`)
  }
}
