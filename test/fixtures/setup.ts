import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import db from '../../src/db/database';

declare global {
  var __DOCKERCOMPOSE__: StartedDockerComposeEnvironment;
}

export default async function () {
  const env = await new DockerComposeEnvironment('db', 'docker-compose.yml')
    .withBuild()
    .withWaitStrategy('database-1', Wait.forLogMessage(/dashboard_widget_app/))
    .up();
  await db.migrate.latest();
  globalThis.__DOCKERCOMPOSE__ = env;
}
