import { camel, snake } from 'radash';

type Row = Record<string, unknown>;

const mapKeys = (mapFn: (key: string) => string) => (row: Row) =>
  Object.keys(row).reduce(
    (acc, key) => ({ ...acc, [mapFn(key)]: row[key] }),
    {},
  );

export const postProcessResponse = (rows: Row[] | Row) =>
  Array.isArray(rows) ? rows.map(mapKeys(camel)) : mapKeys(camel)(rows);

export const wrapIdentifier = (value: string, origImpl: Function, _: any) =>
  origImpl(snake(value));
