import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744472852825 implements MigrationInterface {
  name = 'Migrations1744472852825'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "is_premium" boolean`)
    await queryRunner.query(`ALTER TABLE "user" ADD "language_code" character varying`)
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying`)
    await queryRunner.query(`ALTER TABLE "user" ADD "username" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "language_code"`)
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_premium"`)
  }
}
