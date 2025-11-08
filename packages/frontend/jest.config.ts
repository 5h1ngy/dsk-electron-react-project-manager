import type { Config } from 'jest'

const moduleNameMapper = {
  '^@main/(.*)$': '<rootDir>/packages/electron/src/main/$1',
  '^@preload/(.*)$': '<rootDir>/packages/electron/src/preload/src/$1',
  '^@services/(.*)$': '<rootDir>/packages/shared/src/$1',
  '^@backend/(.*)$': '<rootDir>/packages/backend/src/$1',
  '^@renderer/(.*)$': '<rootDir>/packages/frontend/src/$1',
  '^@seeding/(.*)$': '<rootDir>/packages/seeding/src/$1',
  '\\.(css|less|sass|scss)$': '<rootDir>/packages/frontend/test/__mocks__/styleMock.ts',
  '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/packages/frontend/test/__mocks__/fileMock.ts'
}

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  clearMocks: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/frontend/src/**/*.{ts,tsx}',
    '!packages/frontend/src/**/*.d.ts',
    '!packages/frontend/src/**/index.ts'
  ],
  testMatch: ['<rootDir>/packages/frontend/src/**/*.test.ts?(x)'],
  setupFiles: ['<rootDir>/packages/frontend/test/setupEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/packages/frontend/test/setupRendererTests.ts'],
  moduleNameMapper,
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/packages/frontend/tsconfig.json'
      }
    ]
  }
}

export default config
