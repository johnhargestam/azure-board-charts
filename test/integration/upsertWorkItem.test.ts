import db from '~/src/db/database';
import { WorkItem, WorkItemType } from '~/src/db/entities';
import WorkItemRepository from '~/src/db/WorkItemRepository';

describe('WorkItemRepository', () => {
  const workItem: WorkItem = {
    id: 1,
    title: 'Work',
    created: new Date(),
    type: WorkItemType.Epic,
  };

  beforeAll(() => db.migrate.latest());

  afterEach(() => db('work_item').delete());

  afterAll(() => db.destroy());

  it('adds new rows', async () => {
    await WorkItemRepository.upsert(workItem);

    await db('work_item')
      .select('*')
      .then(rows => expect(rows).toStrictEqual([workItem]));
  });

  it('updates existing rows', async () => {
    await WorkItemRepository.upsert(workItem);
    await WorkItemRepository.upsert({ ...workItem, title: 'Play' });

    await db('work_item')
      .select('*')
      .then(rows =>
        expect(rows).toStrictEqual([
          {
            id: workItem.id,
            title: 'Play',
            created: workItem.created,
            type: WorkItemType.Epic,
          },
        ]),
      );
  });
});
