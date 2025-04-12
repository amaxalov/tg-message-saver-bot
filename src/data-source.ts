import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { User } from './entity/User'
import { Message } from './entity/Message'
import { Sender } from './entity/Sender'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: true,
  entities: [User, Message, Sender],
  subscribers: [],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migration_table',
})
