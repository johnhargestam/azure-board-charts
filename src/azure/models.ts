import type { Observable } from 'rxjs';

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

export interface BoardReference {
  id: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  columnType: ColumnType;
  isSplit: boolean;
  itemLimit: number;
  stateMappings: Partial<Record<WorkItemType, string>>;
}

export interface Board {
  id: string;
  name: string;
  columns: BoardColumn[];
  allowedMappings: Partial<
    Record<ColumnType, Partial<Record<WorkItemType, string[]>>>
  >;
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
  boardColumn?: {
    name: string;
    done: boolean;
  };
}

export interface Batch<T> {
  values: T[];
  continuationToken: string;
}

export interface StreamedBatch<T> extends Batch<T> {
  isLastBatch: boolean;
}

export interface Api {
  getBoardReferences: () => Observable<BoardReference[]>;
  getBoard: (id: string) => Observable<Board>;
  getRevisionsBatch: (
    from: Date,
    token?: string,
  ) => Observable<StreamedBatch<WorkItem>>;
}

export interface Client {
  getBoards: () => Observable<Board>;
  getLatestRevisionsBatches: (
    from: Date,
    token?: string,
  ) => Observable<Batch<WorkItem>>;
}
