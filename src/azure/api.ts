import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { Observable, concatMap, defer, map } from 'rxjs';
import z from 'zod';
import {
  Api,
  Board,
  BoardReference,
  ColumnType,
  StreamedBatch,
  WorkItem,
  WorkItemType,
} from './models';

interface Config {
  url: string;
  pat: string;
  project: string;
  team: string;
  area: string;
}

export const BoardReferencesSchema = z.array(
  z.object({
    id: z.string(),
  }),
);

enum BoardColumnType {
  Incoming = 0,
  InProgress = 1,
  Outgoing = 2,
}

enum Field {
  AreaPath = 'System.AreaPath',
  Title = 'System.Title',
  WorkItemType = 'System.WorkItemType',
  Tags = 'System.Tags',
  CreatedDate = 'System.CreatedDate',
  ChangedDate = 'System.ChangedDate',
  State = 'System.State',
  BoardColumn = 'System.BoardColumn',
  BoardColumnDone = 'System.BoardColumnDone',
}

const BoardColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  columnType: z
    .nativeEnum(BoardColumnType)
    .transform(
      t => [ColumnType.Incoming, ColumnType.InProgress, ColumnType.Outgoing][t],
    ),
  isSplit: z.boolean().default(false),
  itemLimit: z.number().min(0).default(0),
  stateMappings: z.record(z.nativeEnum(WorkItemType), z.string()),
});

const BoardSchema = z.object({
  id: z.string(),
  name: z.string(),
  columns: z.array(BoardColumnSchema),
  allowedMappings: z.record(
    z.nativeEnum(ColumnType),
    z.record(z.nativeEnum(WorkItemType), z.array(z.string())),
  ),
});

const WorkItemSchema = z
  .object({
    id: z.number(),
    fields: z.object({
      [Field.AreaPath]: z.string(),
      [Field.Title]: z.string(),
      [Field.WorkItemType]: z.nativeEnum(WorkItemType),
      [Field.CreatedDate]: z.string().transform(date => new Date(date)),
      [Field.ChangedDate]: z.string().transform(date => new Date(date)),
      [Field.State]: z.string(),
      [Field.BoardColumn]: z.string().optional(),
      [Field.BoardColumnDone]: z.boolean().default(false),
      [Field.Tags]: z
        .string()
        .optional()
        .transform(tags => (tags ? tags.split('; ') : [])),
    }),
  })
  .transform(
    ({ id, fields }): WorkItem => ({
      id,
      areaPath: fields[Field.AreaPath],
      title: fields[Field.Title],
      type: fields[Field.WorkItemType],
      created: fields[Field.CreatedDate],
      changed: fields[Field.ChangedDate],
      state: fields[Field.State],
      tags: fields[Field.Tags],
      boardColumn: fields[Field.BoardColumn]
        ? {
            name: fields[Field.BoardColumn],
            done: fields[Field.BoardColumnDone],
          }
        : undefined,
    }),
  );

const ReportingWorkItemRevisionsBatchSchema = z.object({
  values: z.array(WorkItemSchema),
  continuationToken: z.string(),
  isLastBatch: z.boolean(),
});

const types = [
  WorkItemType.Bug,
  WorkItemType.Epic,
  WorkItemType.Feature,
  WorkItemType.PBI,
];

const fields = [
  Field.AreaPath,
  Field.Title,
  Field.WorkItemType,
  Field.Tags,
  Field.CreatedDate,
  Field.ChangedDate,
  Field.State,
  Field.BoardColumn,
  Field.BoardColumnDone,
];

const webApi = (url: string, pat: string) =>
  new WebApi(url, getPersonalAccessTokenHandler(pat));

const workApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkApi());

const trackingApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkItemTrackingApi());

const getBoardReferences =
  ({ url, pat, project, team }: Config) =>
  (): Observable<BoardReference[]> =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoards({ project, team })),
      map(references => BoardReferencesSchema.parse(references)),
    );

const getBoard =
  ({ url, pat, project, team }: Config) =>
  (id: string): Observable<Board> =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoard({ project, team }, id)),
      map(board => BoardSchema.parse(board)),
    );

const getRevisionsBatch =
  ({ url, pat, project }: Config) =>
  (from: Date, token?: string): Observable<StreamedBatch<WorkItem>> =>
    trackingApi(url, pat).pipe(
      concatMap(api =>
        api.readReportingRevisionsPost({ types, fields }, project, token, from),
      ),
      map(batch => ReportingWorkItemRevisionsBatchSchema.parse(batch)),
    );

const api = (config: Config): Api => ({
  getBoardReferences: getBoardReferences(config),
  getBoard: getBoard(config),
  getRevisionsBatch: getRevisionsBatch(config),
});

export default api;
