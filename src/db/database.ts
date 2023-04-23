import dotenv from 'dotenv';
import knex from 'knex';
import config from '../../knexfile';

dotenv.config();

const environment = process.env.NODE_ENV || 'production';
const db = knex(config[environment]);

export default db;
