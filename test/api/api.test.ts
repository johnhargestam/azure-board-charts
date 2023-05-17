import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { lastValueFrom } from 'rxjs';
import api from '~/src/azure/api';
import { handlers } from './fixtures';
import {
  Board,
  BoardReference,
  ColumnType,
  StreamedBatch,
  WorkItem,
  WorkItemType,
} from '~/src/azure/models';

describe('api', () => {
  const server = setupServer(...handlers);
  const config = {
    url: 'https://az.com/user1',
    pat: 'secret',
    project: 'project1',
    team: 'team1',
    area: 'area1',
  };

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('parses board references', async () => {
    const azureApi = api(config);
    server.use(
      rest.get(
        'https://az.com/user1/project1/team1/_apis/work/boards',
        (_, res, ctx) =>
          res(
            ctx.json({
              count: 3,
              value: [
                {
                  id: 'board1',
                  name: 'Backlog items',
                },
                {
                  id: 'board2',
                  name: 'Features',
                },
                {
                  id: 'board3',
                  name: 'Epics',
                },
              ],
            }),
          ),
      ),
    );

    const references = await lastValueFrom(azureApi.getBoardReferences());

    expect(references).toStrictEqual<BoardReference[]>([
      { id: 'board1' },
      { id: 'board2' },
      { id: 'board3' },
    ]);
  });

  it('parses a board', async () => {
    const azureApi = api(config);
    server.use(
      rest.get(
        'https://az.com/user1/project1/team1/_apis/work/boards/board1',
        (_, res, ctx) =>
          res(
            ctx.json({
              id: 'board1',
              name: 'Board One',
              columns: [
                {
                  id: 'f8523d3f-f2b8-4efe-b86c-edd016768420',
                  name: 'New',
                  itemLimit: 0,
                  stateMappings: {
                    'Product Backlog Item': 'New',
                    Bug: 'New',
                  },
                  columnType: 'incoming',
                },
                {
                  id: '9511200e-0790-46da-934d-58996eeb8487',
                  name: 'Approved',
                  itemLimit: 5,
                  stateMappings: {
                    'Product Backlog Item': 'Approved',
                    Bug: 'Approved',
                  },
                  isSplit: false,
                  description: '',
                  columnType: 'inProgress',
                },
                {
                  id: '4a3d35f5-0c53-49a0-bc5f-84bf642a9aad',
                  name: 'Committed',
                  itemLimit: 5,
                  stateMappings: {
                    'Product Backlog Item': 'Committed',
                    Bug: 'Committed',
                  },
                  isSplit: true,
                  description: '',
                  columnType: 'inProgress',
                },
                {
                  id: '06225d17-465b-4843-92b3-0ee55a767253',
                  name: 'Done',
                  itemLimit: 0,
                  stateMappings: {
                    'Product Backlog Item': 'Done',
                    Bug: 'Done',
                  },
                  columnType: 'outgoing',
                },
              ],
              allowedMappings: {
                Incoming: {
                  Bug: ['New'],
                  'Product Backlog Item': ['New'],
                },
                InProgress: {
                  Bug: ['Approved', 'Committed', 'New'],
                  'Product Backlog Item': ['Approved', 'Committed', 'New'],
                },
                Outgoing: {
                  Bug: ['Done'],
                  'Product Backlog Item': ['Done'],
                },
              },
            }),
          ),
      ),
    );

    const board = await lastValueFrom(azureApi.getBoard('board1'));

    expect(board).toStrictEqual<Board>({
      id: 'board1',
      name: 'Board One',
      columns: [
        {
          id: 'f8523d3f-f2b8-4efe-b86c-edd016768420',
          name: 'New',
          itemLimit: 0,
          stateMappings: {
            [WorkItemType.PBI]: 'New',
            [WorkItemType.Bug]: 'New',
          },
          isSplit: false,
          columnType: ColumnType.Incoming,
        },
        {
          id: '9511200e-0790-46da-934d-58996eeb8487',
          name: 'Approved',
          itemLimit: 5,
          stateMappings: {
            [WorkItemType.PBI]: 'Approved',
            [WorkItemType.Bug]: 'Approved',
          },
          isSplit: false,
          columnType: ColumnType.InProgress,
        },
        {
          id: '4a3d35f5-0c53-49a0-bc5f-84bf642a9aad',
          name: 'Committed',
          itemLimit: 5,
          stateMappings: {
            [WorkItemType.PBI]: 'Committed',
            [WorkItemType.Bug]: 'Committed',
          },
          isSplit: true,
          columnType: ColumnType.InProgress,
        },
        {
          id: '06225d17-465b-4843-92b3-0ee55a767253',
          name: 'Done',
          itemLimit: 0,
          stateMappings: {
            [WorkItemType.PBI]: 'Done',
            [WorkItemType.Bug]: 'Done',
          },
          isSplit: false,
          columnType: ColumnType.Outgoing,
        },
      ],
      allowedMappings: {
        [ColumnType.Incoming]: {
          [WorkItemType.Bug]: ['New'],
          [WorkItemType.PBI]: ['New'],
        },
        [ColumnType.InProgress]: {
          [WorkItemType.Bug]: ['Approved', 'Committed', 'New'],
          [WorkItemType.PBI]: ['Approved', 'Committed', 'New'],
        },
        [ColumnType.Outgoing]: {
          [WorkItemType.Bug]: ['Done'],
          [WorkItemType.PBI]: ['Done'],
        },
      },
    });
  });

  it('parses a work item revisions batch', async () => {
    const azureApi = api(config);
    server.use(
      rest.post(
        'https://az.com/user1/project1/_apis/wit/reporting/workItemRevisions',
        async (req, res, ctx) => {
          await req.json().then(json =>
            expect(json).toStrictEqual({
              types: ['Bug', 'Epic', 'Feature', 'Product Backlog Item'],
              fields: [
                'System.AreaPath',
                'System.Title',
                'System.WorkItemType',
                'System.Tags',
                'System.CreatedDate',
                'System.ChangedDate',
                'System.State',
                'System.BoardColumn',
                'System.BoardColumnDone',
              ],
            }),
          );
          return res(
            ctx.json({
              values: [
                {
                  id: 1,
                  rev: 1,
                  fields: {
                    'System.AreaPath': 'area1',
                    'System.WorkItemType': 'Product Backlog Item',
                    'System.State': 'New',
                    'System.CreatedDate': '2023-04-05T16:51:49.927Z',
                    'System.ChangedDate': '2023-04-05T16:51:49.927Z',
                    'System.Title': 'PBI1',
                    'System.BoardColumn': 'New',
                    'System.BoardColumnDone': false,
                  },
                },
                {
                  id: 1,
                  rev: 2,
                  fields: {
                    'System.AreaPath': 'area1',
                    'System.WorkItemType': 'Product Backlog Item',
                    'System.State': 'Committed',
                    'System.CreatedDate': '2023-04-05T16:51:49.927Z',
                    'System.ChangedDate': '2023-04-05T16:52:01.52Z',
                    'System.Title': 'PBI1',
                    'System.Tags': 'Tag1; Tag2',
                    'System.BoardColumn': 'In Progress',
                    'System.BoardColumnDone': false,
                  },
                },
                {
                  id: 1,
                  rev: 3,
                  fields: {
                    'System.AreaPath': 'area1',
                    'System.WorkItemType': 'Product Backlog Item',
                    'System.State': 'Removed',
                    'System.CreatedDate': '2023-04-05T16:51:49.927Z',
                    'System.ChangedDate': '2023-04-05T18:46:30.893Z',
                    'System.Title': 'PBI1',
                    'System.Tags': 'Tag1; Tag2',
                  },
                },
              ],
              continuationToken: '13;5;5;Discussion',
              isLastBatch: true,
            }),
          );
        },
      ),
    );

    const batch = await lastValueFrom(azureApi.getRevisionsBatch(new Date()));

    expect(batch).toStrictEqual<StreamedBatch<WorkItem>>({
      values: [
        {
          id: 1,
          areaPath: 'area1',
          title: 'PBI1',
          type: WorkItemType.PBI,
          created: new Date('2023-04-05T16:51:49.927Z'),
          changed: new Date('2023-04-05T16:51:49.927Z'),
          state: 'New',
          tags: [],
          boardColumn: {
            name: 'New',
            done: false,
          },
        },
        {
          id: 1,
          areaPath: 'area1',
          title: 'PBI1',
          type: WorkItemType.PBI,
          created: new Date('2023-04-05T16:51:49.927Z'),
          changed: new Date('2023-04-05T16:52:01.52Z'),
          state: 'Committed',
          tags: ['Tag1', 'Tag2'],
          boardColumn: {
            name: 'In Progress',
            done: false,
          },
        },
        {
          id: 1,
          areaPath: 'area1',
          title: 'PBI1',
          type: WorkItemType.PBI,
          created: new Date('2023-04-05T16:51:49.927Z'),
          changed: new Date('2023-04-05T18:46:30.893Z'),
          state: 'Removed',
          tags: ['Tag1', 'Tag2'],
          boardColumn: undefined,
        },
      ],
      continuationToken: '13;5;5;Discussion',
      isLastBatch: true,
    });
  });
});
