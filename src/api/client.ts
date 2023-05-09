import { Observable, concatMap, from, map } from 'rxjs';
import { Api, Board } from './azure';

export interface Client {
  boards: () => Observable<Board>;
}

type BoardId = string;

const boardIds = (api: Api): Observable<BoardId> =>
  api.boardReferences().pipe(
    map(references => references.filter(({ id }) => !!id).map(({ id }) => id!)),
    concatMap(ids => from(ids)),
  );

const client = (api: Api): Client => ({
  boards: () => boardIds(api).pipe(concatMap(id => api.board(id))),
});

export default client;
