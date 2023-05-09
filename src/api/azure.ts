import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import WorkInterfaces from 'azure-devops-node-api/interfaces/WorkInterfaces';
import { Observable, concatMap, defer } from 'rxjs';

export interface Board extends WorkInterfaces.Board {}
export interface BoardReference extends WorkInterfaces.BoardReference {}

export interface Config {
  url: string;
  pat: string;
  team: string;
  project: string;
}

export interface Api {
  boardReferences: () => Observable<BoardReference[]>;
  board: (id: string) => Observable<Board>;
}

const webApi = (url: string, pat: string) =>
  new WebApi(url, getPersonalAccessTokenHandler(pat));

const workApi = (url: string, pat: string) =>
  defer(() => webApi(url, pat).getWorkApi());

const api = ({ url, pat, team, project }: Config): Api => ({
  boardReferences: () =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoards({ team, project })),
    ),
  board: (id: string) =>
    workApi(url, pat).pipe(
      concatMap(api => api.getBoard({ team, project }, id)),
    ),
});

export default api;
