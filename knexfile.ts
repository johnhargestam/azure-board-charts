import dotenv from 'dotenv';
import type { Knex } from 'knex';
import { assign } from 'radash';
import { migrationSource } from './src/db/migrations';
import { postProcessResponse, wrapIdentifier } from './src/db/conversions';

dotenv.config();

const { DB_URI, DB_USER, DB_PASSWORD } = process.env;

const baseConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'user',
    password: 'password',
    database: 'dashboard_widget_app',
  },
  migrations: {
    migrationSource,
  },
  postProcessResponse,
  wrapIdentifier,
};

const config: { [key: string]: Knex.Config } = {
  test: baseConfig,
  development: baseConfig,
  production: assign(baseConfig, {
    compileSqlOnError: false,
    connection: {
      host: DB_URI,
      user: DB_USER,
      password: DB_PASSWORD,
    },
  }),
};

export default config;
