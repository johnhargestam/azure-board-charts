import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig');
import type { Config } from 'jest';

export default async (): Promise<Config> => ({
  preset: 'ts-jest',
  verbose: true,
  roots: ['test'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/src/',
  }),
});
