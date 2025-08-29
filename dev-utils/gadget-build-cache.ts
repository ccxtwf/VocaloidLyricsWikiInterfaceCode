import { DatabaseSync } from 'node:sqlite';
import { sep } from 'path';

let database: DatabaseSync;
createBuildCache();

function createBuildCache(): DatabaseSync {
  if (database) { return database; }
  database = new DatabaseSync(':memory:');
  database.exec(`
  CREATE TABLE GadgetDefinitions (
    blob BLOB
  );`);
  database.exec(`
  CREATE TABLE GadgetImplementations (
    subdir TEXT PRIMARY KEY NOT NULL,
    registered_name TEXT,
    serve TEXT
  );`);
  database.exec(`
  CREATE TABLE GadgetSrcFiles (
    gadget_subdir TEXT NOT NULL,
    rel_filepath TEXT NOT NULL
  );`);
  return database;
}

function resolveGadgetFilepathSegments(relativeFilePath: string): [string, string, string] {
  const [gadgetSubdir, ...gadgetFilepathSegments] = relativeFilePath.split(sep);
  return [gadgetSubdir, gadgetFilepathSegments.join(sep), gadgetFilepathSegments.at(-1) as string];
}

/*
export function getCachedGadgetsDefinition(): GadgetsDefinition {
  const q = database.prepare(`SELECT * FROM GadgetDefinitions LIMIT 1;`);
}

export function saveGadgetsDefinitionToCache(gadgetsDefinition: GadgetsDefinition) {

}
*/

export function existsInBuildCache(relativeFilePath: string): boolean {
  const [gadgetSubdir, gadgetFilepath, _] = resolveGadgetFilepathSegments(relativeFilePath);
  const q = database.prepare(`SELECT DISTINCT 1 FROM GadgetSrcFiles WHERE gadget_subdir = ? AND rel_filepath = ?;`);
  return q.all(gadgetSubdir, gadgetFilepath).length > 0;
}

export function addFileToBuildCache(relativeFilePath: string) {
  const [gadgetSubdir, gadgetFilepath, _] = resolveGadgetFilepathSegments(relativeFilePath);
  const q = database.prepare(`INSERT INTO GadgetSrcFiles WHERE gadget_subdir = ? AND rel_filepath = ?;`);
  q.run(gadgetSubdir, gadgetFilepath);
}

export function removeFileFromBuildCache(relativeFilePath: string) {
  const [gadgetSubdir, gadgetFilepath, _] = resolveGadgetFilepathSegments(relativeFilePath);
  const q = database.prepare(`DELETE FROM GadgetSrcFiles WHERE gadget_subdir = ? AND rel_filepath = ?;`);
  q.run(gadgetSubdir, gadgetFilepath);
}