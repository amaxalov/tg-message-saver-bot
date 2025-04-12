import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744474258185 implements MigrationInterface {
  name = 'Migrations1744474258185'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sender" ADD "first_name" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "sender" ADD "last_name" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "sender" ADD "username" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "sender" ADD "telegramId" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "message" ADD "senderId" integer`)
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "messageId"`)
    await queryRunner.query(`ALTER TABLE "message" ADD "messageId" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "assets" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "sender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`)
    await queryRunner.query(`ALTER TABLE "message" ALTER COLUMN "assets" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "messageId"`)
    await queryRunner.query(`ALTER TABLE "message" ADD "messageId" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "senderId"`)
    await queryRunner.query(`ALTER TABLE "sender" DROP COLUMN "telegramId"`)
    await queryRunner.query(`ALTER TABLE "sender" DROP COLUMN "username"`)
    await queryRunner.query(`ALTER TABLE "sender" DROP COLUMN "last_name"`)
    await queryRunner.query(`ALTER TABLE "sender" DROP COLUMN "first_name"`)
  }
}
