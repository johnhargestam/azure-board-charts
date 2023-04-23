import { describe, expect, test } from '@jest/globals';
import db from '~/db/database';

describe('database', () => {
  test('select 1', async () => {
    await db.raw('SELECT 1 AS one').then(([{ one }]) => expect(one).toBe(1));
  });
});
