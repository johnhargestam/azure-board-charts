import db from './src/db/database';

db.raw('SELECT 1').then(console.log);
