import db from '~/db/database';

db.raw('SELECT 1').then(console.log);
