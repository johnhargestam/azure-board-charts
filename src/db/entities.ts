import { WorkItemType } from '~/src/azure/api';

export enum StateCategory {
  Proposed = 'Proposed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Removed = 'Removed',
}

export enum ColumnType {
  Incoming = 'incoming',
  InProgress = 'inProgress',
  Outgoing = 'outgoing',
}

export interface ContinuationToken {
  id: number;
  value: string;
  received: Date;
}

export interface WorkItem {
  id: number;
  title: string;
  created: Date;
  type: WorkItemType;
}

export interface Tag {
  id: number;
  name: string;
}

export interface WorkItemTag {
  workItemId: number;
  tagId: string;
}

export interface State {
  id: number;
  name: string;
  category: StateCategory;
}

export interface Board {
  id: string;
  name: string;
}

export interface BoardColumn {
  id: number;
  name: string;
  done: boolean;
  itemLimit: number;
  sequence: number;
  boardId: string;
}

export interface BoardColumnStateMapping {
  boardColumnId: number;
  stateId: number;
  workItemType: WorkItemType;
}

export interface WorkItemStateRevision {
  workItemId: number;
  revised: string;
  stateId: string;
}

export interface WorkItemBoardColumnRevision {
  workItemId: number;
  revised: string;
  boardColumnId: string;
}

export interface WorkItemBlockRevision {
  workItemId: number;
  revised: string;
  blocked: string;
}

declare module 'knex/types/tables' {
  interface Tables {
    ContinuationToken: ContinuationToken;
    WorkItemType: WorkItemType;
    WorkItem: WorkItem;
    Tag: Tag;
    WorkItemTag: WorkItemTag;
    StateCategory: StateCategory;
    State: State;
    WorkItemStateRevision: WorkItemStateRevision;
    BoardColumn: BoardColumn;
    WorkItemBoardColumnRevision: WorkItemBoardColumnRevision;
    WorkItemBlockRevision: WorkItemBlockRevision;
  }
}
