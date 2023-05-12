import Work from 'azure-devops-node-api/interfaces/WorkInterfaces';
import Track from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { Observable } from 'rxjs';

export enum WorkItemType {
  Bug = 'Bug',
  Epic = 'Epic',
  Feature = 'Feature',
  PBI = 'Product Backlog Item',
}

export enum Field {
  Id = 'System.Id',
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

export interface WorkItemFilter {
  types: WorkItemType[];
  fields: Field[];
  from: Date;
}

export interface Board extends Work.Board {}
export interface BoardReference extends Work.BoardReference {}
export interface RevisionsBatch extends Track.ReportingWorkItemRevisionsBatch {}

export interface Config {
  url: string;
  pat: string;
  project: string;
  team: string;
  area: string;
}

export interface Api {
  getBoardReferences: () => Observable<BoardReference[]>;
  getBoard: (id: string) => Observable<Board>;
  getRevisions: (
    filter: WorkItemFilter,
    token?: string,
  ) => Observable<RevisionsBatch>;
}

export interface Client {
  getBoards: () => Observable<Board>;
  getRevisions: (from: Date, token?: string) => Observable<RevisionsBatch>;
}
