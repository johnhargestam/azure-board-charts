import dotenv from 'dotenv';
import type { Knex } from 'knex';
import { migrationSource } from './migration';

dotenv.config();

const { DB_URI, DB_USER, DB_PASSWORD } = process.env;

const config: { [key: string]: Knex.Config } = {
  test: {
    client: 'mssql',
    connection: {
      host: 'localhost',
      port: 1433,
      user: 'sa',
      password: 'Password1',
      database: 'dashboard_widget_app',
    },
    migrations: {
      migrationSource,
    },
  },
  development: {
    client: 'mssql',
    connection: {
      host: 'localhost',
      port: 1433,
      user: 'sa',
      password: 'Password1',
      database: 'dashboard_widget_app',
    },
    migrations: {
      migrationSource,
    },
  },
  production: {
    client: 'mssql',
    compileSqlOnError: false,
    connection: {
      host: DB_URI,
      port: 1433,
      user: DB_USER,
      password: DB_PASSWORD,
      database: 'dashboard_widget_app',
    },
    migrations: {
      migrationSource,
    },
  },
};

export default config;
