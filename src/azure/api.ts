import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { Observable, concatMap, defer, map } from 'rxjs';
import {
  Api,
  Board,
  BoardReference,
  BoardReferenceSchema,
  BoardSchema,
  Field,
  ReportingWorkItemRevisionsBatchSchema,
  StreamedBatch,
  WorkItem,
  WorkItemType,
  toWorkItem,
} from './models';

interface Config {
  url: string;
  pat: string;
  project: string;
  team: string;
  area: string;
}

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
      map(refs => refs.map(ref => BoardReferenceSchema.parse(ref))),
    );

const getBoard =
  ({ url, pat, project, team }: Config) =>
  (id: string): Observable<Board> =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoard({ project, team }, id)),
      map(board => BoardSchema.parse(board)),
    );

const getRevisions =
  ({ url, pat, project }: Config) =>
  (from: Date, token?: string): Observable<StreamedBatch<WorkItem>> =>
    trackingApi(url, pat).pipe(
      concatMap(api =>
        api.readReportingRevisionsPost({ types, fields }, project, token, from),
      ),
      map(batch => ReportingWorkItemRevisionsBatchSchema.parse(batch)),
      map(({ values, continuationToken, isLastBatch }) => ({
        values: values.map(toWorkItem),
        continuationToken,
        isLastBatch,
      })),
    );

const api = (config: Config): Api => ({
  getBoardReferences: getBoardReferences(config),
  getBoard: getBoard(config),
  getRevisions: getRevisions(config),
});

export default api;
