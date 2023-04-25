import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig');
import type { Config } from 'jest';

export default async (): Promise<Config> => ({
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  verbose: true,
  roots: ['<rootDir>'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
});
