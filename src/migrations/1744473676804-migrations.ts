import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migrations1744473676804 implements MigrationInterface {
  name = 'Migrations1744473676804'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sender_messages_message" ("senderId" integer NOT NULL, "messageId" integer NOT NULL, CONSTRAINT "PK_f5290caa07ec16769c6ed0de0a6" PRIMARY KEY ("senderId", "messageId"))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_3949770c7db8b23dc8b17cda18" ON "sender_messages_message" ("senderId") `)
    await queryRunner.query(`CREATE INDEX "IDX_176ae7699ee316672bf74f3f89" ON "sender_messages_message" ("messageId") `)
    await queryRunner.query(
      `ALTER TABLE "sender_messages_message" ADD CONSTRAINT "FK_3949770c7db8b23dc8b17cda18f" FOREIGN KEY ("senderId") REFERENCES "sender"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
    await queryRunner.query(
      `ALTER TABLE "sender_messages_message" ADD CONSTRAINT "FK_176ae7699ee316672bf74f3f899" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sender_messages_message" DROP CONSTRAINT "FK_176ae7699ee316672bf74f3f899"`)
    await queryRunner.query(`ALTER TABLE "sender_messages_message" DROP CONSTRAINT "FK_3949770c7db8b23dc8b17cda18f"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_176ae7699ee316672bf74f3f89"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3949770c7db8b23dc8b17cda18"`)
    await queryRunner.query(`DROP TABLE "sender_messages_message"`)
  }
}
