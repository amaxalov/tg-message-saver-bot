import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744567973927 implements MigrationInterface {
  name = 'Migrations1744567973927'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "business_connection_ids" jsonb NOT NULL DEFAULT '[]'`)
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "messageId"`)
    await queryRunner.query(`ALTER TABLE "message" ADD "messageId" character varying NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "messageId"`)
    await queryRunner.query(`ALTER TABLE "message" ADD "messageId" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "business_connection_ids"`)
  }
}
