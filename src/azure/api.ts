import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import Work from 'azure-devops-node-api/interfaces/WorkInterfaces';
import Tracking from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { Observable, concatMap, defer, map } from 'rxjs';

const webApi = (url: string, pat: string) =>
  new WebApi(url, getPersonalAccessTokenHandler(pat));

const workApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkApi());

const trackingApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkItemTrackingApi());

export interface Config {
  url: string;
  pat: string;
  project: string;
  team: string;
  area: string;
}

const boardReferences =
  ({ url, pat, project, team }: Config) =>
  () =>
    workApi(url, pat).pipe(concatMap(api => api.getBoards({ project, team })));

const board =
  ({ url, pat, project, team }: Config) =>
  (id: string) =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoard({ project, team }, id)),
    );

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

const revisions =
  ({ url, pat, project }: Config) =>
  ({ types, fields, from }: WorkItemFilter, token?: string) =>
    trackingApi(url, pat).pipe(
      concatMap(api =>
        api.readReportingRevisionsPost({ types, fields }, project, token, from),
      ),
    );

export interface Board extends Work.Board {}
export interface BoardReference extends Work.BoardReference {}
export interface RevisionsBatch
  extends Tracking.ReportingWorkItemRevisionsBatch {}

export interface Api {
  boardReferences: () => Observable<BoardReference[]>;
  board: (id: string) => Observable<Board>;
  revisions: (
    filter: WorkItemFilter,
    token?: string,
  ) => Observable<RevisionsBatch>;
}

const api = (config: Config): Api => ({
  boardReferences: boardReferences(config),
  board: board(config),
  revisions: revisions(config),
});

export default api;
