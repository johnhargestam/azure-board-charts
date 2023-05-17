import { EMPTY, concatMap, expand, map, mergeAll } from 'rxjs';
import type { Api, Client } from './models';

const getAllBoards = (api: Api) => () =>
  api.getBoardReferences().pipe(
    mergeAll(),
    concatMap(ref => api.getBoard(ref.id)),
  );

const getAllRevisions = (api: Api) => (from: Date, token?: string) =>
  api.getRevisionsBatch(from, token).pipe(
    expand(({ isLastBatch, continuationToken }) =>
      isLastBatch ? EMPTY : api.getRevisionsBatch(from, continuationToken),
    ),
    map(({ values, continuationToken }) => ({ values, continuationToken })),
  );

const client = (api: Api): Client => ({
  getBoards: getAllBoards(api),
  getLatestRevisionsBatches: getAllRevisions(api),
});

export default client;
