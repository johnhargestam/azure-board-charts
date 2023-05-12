import { EMPTY, Observable, concatMap, expand, from, map } from 'rxjs';
import { Api, Client, Field, WorkItemType } from './models';

const boardIds = (api: Api): Observable<string> =>
  api.getBoardReferences().pipe(
    map(references => references.filter(({ id }) => !!id).map(({ id }) => id!)),
    concatMap(ids => from(ids)),
  );

const boards = (api: Api) => () =>
  boardIds(api).pipe(concatMap(id => api.getBoard(id)));

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
    .getRevisions({ types, fields, from }, token)
    .pipe(
      expand(({ isLastBatch, continuationToken }) =>
        isLastBatch
          ? EMPTY
          : api.getRevisions({ types, fields, from }, continuationToken),
      ),
    );

const client = (api: Api): Client => ({
  getBoards: boards(api),
  getRevisions: revisions(api),
});

export default client;
