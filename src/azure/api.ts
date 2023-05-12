import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { concatMap, defer } from 'rxjs';
import { Api, Config, WorkItemFilter } from './models';

const webApi = (url: string, pat: string) =>
  new WebApi(url, getPersonalAccessTokenHandler(pat));

const workApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkApi());

const trackingApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkItemTrackingApi());

const boardIds =
  ({ url, pat, project, team }: Config) =>
  () =>
    workApi(url, pat).pipe(concatMap(api => api.getBoards({ project, team })));

const board =
  ({ url, pat, project, team }: Config) =>
  (id: string) =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoard({ project, team }, id)),
    );

const revisions =
  ({ url, pat, project }: Config) =>
  ({ types, fields, from }: WorkItemFilter, token?: string) =>
    trackingApi(url, pat).pipe(
      concatMap(api =>
        api.readReportingRevisionsPost({ types, fields }, project, token, from),
      ),
    );

const api = (config: Config): Api => ({
  getBoardReferences: boardIds(config),
  getBoard: board(config),
  getRevisions: revisions(config),
});

export default api;
