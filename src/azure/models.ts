import Work from 'azure-devops-node-api/interfaces/WorkInterfaces';
import Track from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { Observable } from 'rxjs';
import * as z from 'zod';

export enum WorkItemType {
  Bug = 'Bug',
  Epic = 'Epic',
  Feature = 'Feature',
  PBI = 'Product Backlog Item',
}

export enum StateCategory {
  Proposed = 'Proposed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Removed = 'Removed',
}

export enum ColumnType {
  Incoming = 'Incoming',
  InProgress = 'InProgress',
  Outgoing = 'Outgoing',
}

export enum Field {
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

export const BoardReferenceSchema = z.object({
  id: z.string(),
}) satisfies z.ZodType<Work.BoardReference>;

export type BoardReference = z.output<typeof BoardReferenceSchema>;

enum BoardColumnType {
  Incoming = 0,
  InProgress = 1,
  Outgoing = 2,
}

const BoardColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  columnType: z.nativeEnum(BoardColumnType),
  isSplit: z.boolean().default(false),
  itemLimit: z.number().default(0),
  stateMappings: z.record(z.nativeEnum(WorkItemType), z.string()),
}) satisfies z.ZodType<Work.BoardColumn>;

export const BoardSchema = z.object({
  id: z.string(),
  name: z.string(),
  columns: z.array(BoardColumnSchema),
  allowedMappings: z.record(
    z.nativeEnum(ColumnType),
    z.record(z.nativeEnum(WorkItemType), z.array(z.string())),
  ),
}) satisfies z.ZodType<Work.Board>;

export type Board = z.output<typeof BoardSchema>;

export const WorkItemFieldsSchema = z.object({
  id: z.number(),
  fields: z.object({
    [Field.AreaPath]: z.string(),
    [Field.Title]: z.string(),
    [Field.WorkItemType]: z.nativeEnum(WorkItemType),
    [Field.CreatedDate]: z.string().transform(date => new Date(date)),
    [Field.ChangedDate]: z.string().transform(date => new Date(date)),
    [Field.State]: z.string(),
    [Field.BoardColumn]: z.string(),
    [Field.BoardColumnDone]: z.boolean().default(false),
    [Field.Tags]: z
      .string()
      .optional()
      .transform(tags => (tags ? tags.split('; ') : [])),
  }),
}) satisfies z.ZodType<Track.WorkItem>;

type WorkItemFields = z.output<typeof WorkItemFieldsSchema>;

export const ReportingWorkItemRevisionsBatchSchema = z.object({
  values: z.array(WorkItemFieldsSchema),
  continuationToken: z.string(),
  isLastBatch: z.boolean(),
}) satisfies z.ZodType<Track.StreamedBatch<Track.WorkItem>>;

export interface StreamedBatch<T> {
  values: T[];
  continuationToken: string;
  isLastBatch: boolean;
}

export interface Batch<T> {
  values: T[];
  continuationToken: string;
}

export interface WorkItem {
  id: number;
  areaPath: string;
  title: string;
  type: WorkItemType;
  created: Date;
  changed: Date;
  state: string;
  tags: string[];
  boardColumn: {
    name: string;
    done: boolean;
  };
}

export const toWorkItem = (value: WorkItemFields): WorkItem => ({
  id: value.id,
  areaPath: value.fields[Field.AreaPath],
  title: value.fields[Field.Title],
  type: value.fields[Field.WorkItemType],
  created: value.fields[Field.CreatedDate],
  changed: value.fields[Field.ChangedDate],
  state: value.fields[Field.State],
  tags: value.fields[Field.Tags],
  boardColumn: {
    name: value.fields[Field.BoardColumn],
    done: value.fields[Field.BoardColumnDone],
  },
});

export interface Api {
  getBoardReferences: () => Observable<BoardReference[]>;
  getBoard: (id: string) => Observable<Board>;
  getRevisions: (
    from: Date,
    token?: string,
  ) => Observable<StreamedBatch<WorkItem>>;
}

export interface Client {
  getBoards: () => Observable<Board>;
  getLatestRevisions: (
    from: Date,
    token?: string,
  ) => Observable<Batch<WorkItem>>;
}
