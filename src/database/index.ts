import { type Knex, knex as setupKnex } from 'knex'
import { env } from '../env'

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.DATABASE_CLIENT === 'sqlite3'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './src/database/migrations',
  },
}

export const knex = setupKnex(config)
