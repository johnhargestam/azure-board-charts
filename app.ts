import dotenv from 'dotenv';
import knex from 'knex';
import config from './knexfile';

dotenv.config();

const db = knex(config[process.env.NODE_ENV || 'production']);

db.raw('SELECT 1').then(console.log);
