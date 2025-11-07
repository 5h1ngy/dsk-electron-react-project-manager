import type { Config } from 'jest'

const sharedModuleNameMapper = {
  '^@main/(.*)$': '<rootDir>/packages/electron/src/main/$1',
  '^@preload/(.*)$': '<rootDir>/packages/electron/src/preload/src/$1',
  '^@services/(.*)$': '<rootDir>/packages/shared/src/$1',
  '^@api/(.*)$': '<rootDir>/packages/api/src/$1',
  '^@renderer/(.*)$': '<rootDir>/packages/electron/src/renderer/src/$1',
  '^@seeding/(.*)$': '<rootDir>/packages/seeding/src/$1',
  '\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/styleMock.ts',
  '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.ts'
}

const config: Config = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'packages/api/src/**/*.{ts,tsx}',
    '!packages/api/src/**/*.d.ts',
    '!packages/api/src/**/*.test.ts?(x)'
  ],
  moduleNameMapper: sharedModuleNameMapper,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/api/src/**/*.test.ts?(x)'],
  setupFiles: ['<rootDir>/test/setupEnv.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/packages/api/tsconfig.api.json'
      }
    ]
  }
}

export default config
