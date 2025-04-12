import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744473377735 implements MigrationInterface {
  name = 'Migrations1744473377735'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sender" ("id" SERIAL NOT NULL, "userId" integer, CONSTRAINT "PK_8b4c940381151ff7dfc1bc34e9a" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "sender" ADD CONSTRAINT "FK_6c6315acee6a2f2d93cb4eb8268" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sender" DROP CONSTRAINT "FK_6c6315acee6a2f2d93cb4eb8268"`)
    await queryRunner.query(`DROP TABLE "sender"`)
  }
}
