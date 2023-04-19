import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();
const { DB_URI, DB_USER, DB_PASSWORD } = process.env;

const db = knex({
  client: 'mssql',
  connection: {
    host: DB_URI,
    port: 1433,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'master',
  },
});

db.raw('SELECT 1').then(console.log);
