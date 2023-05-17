import { rest } from 'msw';

export const handlers = [
  rest.options('https://az.com/user1/_apis/Location', (_, res, ctx) =>
    res(
      ctx.json({
        value: [
          {
            id: 'e81700f7-3be2-46de-8624-2eb35882fcaa',
            area: 'Location',
            resourceName: 'ResourceAreas',
            routeTemplate: '_apis/{resource}/{areaId}',
            resourceVersion: 1,
            minVersion: '3.2',
            maxVersion: '7.1',
            releasedVersion: '0.0',
          },
        ],
        count: 1,
      }),
    ),
  ),
  rest.get('https://az.com/user1/_apis/ResourceAreas', (_, res, ctx) =>
    res(
      ctx.json({
        value: [
          {
            id: '1d4f49f9-02b9-4e26-b826-2cdb6195f2a9',
            name: 'work',
            locationUrl: 'https://az.com/user1/',
          },
          {
            id: '5264459e-e5e0-4bd8-b118-0985e68a4ec5',
            name: 'wit',
            locationUrl: 'https://az.com/user1/',
          },
        ],
        count: 2,
      }),
    ),
  ),
  rest.options('https://az.com/user1/_apis/work', (_, res, ctx) =>
    res(
      ctx.json({
        value: [
          {
            id: '23ad19fc-3b8e-4877-8462-b3f92bc06b40',
            area: 'work',
            resourceName: 'boards',
            routeTemplate: '{project}/{team}/_apis/{area}/{resource}/{id}',
            resourceVersion: 1,
            minVersion: '2.0',
            maxVersion: '7.1',
            releasedVersion: '7.0',
          },
        ],
        count: 1,
      }),
    ),
  ),
  rest.options('https://az.com/user1/_apis/wit', (_, res, ctx) =>
    res(
      ctx.json({
        value: [
          {
            id: 'f828fe59-dd87-495d-a17c-7a8d6211ca6c',
            area: 'wit',
            resourceName: 'workItemRevisions',
            routeTemplate: '{project}/_apis/{area}/reporting/{resource}',
            resourceVersion: 2,
            minVersion: '2.0',
            maxVersion: '7.1',
            releasedVersion: '7.0',
          },
        ],
        count: 1,
      }),
    ),
  ),
];
