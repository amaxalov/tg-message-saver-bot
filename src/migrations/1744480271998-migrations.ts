import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744480271998 implements MigrationInterface {
  name = 'Migrations1744480271998'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sender" DROP COLUMN "telegramId"`)
    await queryRunner.query(`ALTER TABLE "sender" ADD "telegramId" character varying NOT NULL`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "telegramId"`)
    await queryRunner.query(`ALTER TABLE "user" ADD "telegramId" character varying NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "telegramId"`)
    await queryRunner.query(`ALTER TABLE "user" ADD "telegramId" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "sender" DROP COLUMN "telegramId"`)
    await queryRunner.query(`ALTER TABLE "sender" ADD "telegramId" integer NOT NULL`)
  }
}
