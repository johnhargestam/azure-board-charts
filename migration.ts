import fs from 'fs/promises';
import path from 'path';
import type { Knex } from 'knex';

interface SqlMigration {
  folder: string;
  file: string;
}

const getMigrations = (): Promise<SqlMigration[]> =>
  fs.readdir('migrations').then(folders =>
    folders.map(folder => ({
      file: folder, //migrate:list support
      folder,
    })),
  );

const getMigrationName = (migration: SqlMigration): string => migration.folder;

const readSql = ({ folder }: SqlMigration, file: string): Promise<string> =>
  fs.readFile(path.join('migrations', folder, file), { encoding: 'utf8' });

const toKnexFunction = (sql: string) => (knex: Knex) => knex.raw(sql);

const getMigration = (migration: SqlMigration): Promise<Knex.Migration> =>
  Promise.all([
    readSql(migration, 'up.sql').then(toKnexFunction),
    readSql(migration, 'down.sql').then(toKnexFunction),
  ]).then(([up, down]) => ({ up, down }));

export const migrationSource: Knex.MigrationSource<SqlMigration> = {
  getMigrations,
  getMigrationName,
  getMigration,
};
