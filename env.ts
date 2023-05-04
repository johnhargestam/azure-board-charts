import dotenv from 'dotenv';

dotenv.config();

type Config = {
  [key: string]: string;
};

const throwMissingKey = (key: string) => {
  throw `Missing configuration key '${key}'`;
};

const config = (keys: string[]): Config =>
  keys.reduce(
    (obj, key) => ({ ...obj, [key]: process.env[key] || throwMissingKey(key) }),
    {},
  );

export default config([
  'AZURE_URL',
  'AZURE_PAT',
  'AZURE_PROJECT',
  'AZURE_TEAM',
  'DB_URI',
  'DB_USER',
  'DB_PASSWORD',
]);
