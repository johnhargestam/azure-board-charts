import { EMPTY, concatMap, expand, map, mergeAll } from 'rxjs';
import { Api, Client } from './models';

const getAllBoards = (api: Api) => () =>
  api.getBoardReferences().pipe(
    mergeAll(),
    concatMap(ref => api.getBoard(ref.id)),
  );

const getAllRevisions = (api: Api) => (from: Date, token?: string) =>
  api.getRevisions(from, token).pipe(
    expand(({ isLastBatch, continuationToken }) =>
      isLastBatch ? EMPTY : api.getRevisions(from, continuationToken),
    ),
    map(({ values, continuationToken }) => ({ values, continuationToken })),
  );

const client = (api: Api): Client => ({
  getBoards: getAllBoards(api),
  getLatestRevisions: getAllRevisions(api),
});

export default client;
