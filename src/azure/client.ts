import { EMPTY, Observable, concatMap, expand, from, map } from 'rxjs';
import { Api, Board, Field, RevisionsBatch, WorkItemType } from './api';

const boardIds = (api: Api): Observable<string> =>
  api.boardReferences().pipe(
    map(references => references.filter(({ id }) => !!id).map(({ id }) => id!)),
    concatMap(ids => from(ids)),
  );

const boards = (api: Api) => () =>
  boardIds(api).pipe(concatMap(id => api.board(id)));

const types = [
  WorkItemType.Bug,
  WorkItemType.Epic,
  WorkItemType.Feature,
  WorkItemType.PBI,
];

const fields = [
  Field.Id,
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

const revisions = (api: Api) => (from: Date, token?: string) =>
  api
    .revisions({ types, fields, from }, token)
    .pipe(
      expand(({ isLastBatch, continuationToken }) =>
        isLastBatch
          ? EMPTY
          : api.revisions({ types, fields, from }, continuationToken),
      ),
    );

export interface Client {
  boards: () => Observable<Board>;
  revisions: (from: Date, token?: string) => Observable<RevisionsBatch>;
}

const client = (api: Api): Client => ({
  boards: boards(api),
  revisions: revisions(api),
});

export default client;
