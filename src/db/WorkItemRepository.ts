import db from './database';
import { WorkItem } from './entities';

export default {
  upsert: (workItem: WorkItem) =>
    db('WorkItem').insert(workItem).onConflict('id').merge(),
};
