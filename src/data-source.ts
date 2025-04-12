import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { User } from './entity/User'
import { Message } from './entity/Message'

dotenv.config()
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  logging: true,
  entities: [User, Message],
  subscribers: [],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migration_table',
})
