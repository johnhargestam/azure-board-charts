import { WebApi, getPersonalAccessTokenHandler } from 'azure-devops-node-api';
import { TeamContext } from 'azure-devops-node-api/interfaces/CoreInterfaces';
import { Observable, concatMap, defer, from, map } from 'rxjs';
import env from '~/env';

const webApi = new WebApi(
  env.AZURE_URL,
  getPersonalAccessTokenHandler(env.AZURE_PAT),
);

const team: TeamContext = {
  projectId: env.AZURE_PROJECT,
  teamId: env.AZURE_TEAM,
};

const workApi$ = defer(() => webApi.getWorkApi())

const getBoardIds = () =>
  workApi$.pipe(
    concatMap(workApi => defer(() => workApi.getBoards(team))),
    map(references => references.filter(({ id }) => !!id).map(({ id }) => id!)),
    concatMap(ids => from(ids)),
  );

const getBoard = (boardId$: Observable<string>) =>
  workApi$.pipe(
    concatMap(workApi =>
      boardId$.pipe(concatMap(id => defer(() => workApi.getBoard(team, id)))),
    ),
  );

const getBoards = () => getBoardIds().pipe(getBoard);

export default {
  getBoards
}
