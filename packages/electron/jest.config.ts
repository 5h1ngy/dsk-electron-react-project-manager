import type { Config } from 'jest'

const sharedModuleNameMapper = {
  '^@main/(.*)$': '<rootDir>/packages/electron/src/main/$1',
  '^@preload/(.*)$': '<rootDir>/packages/electron/src/preload/src/$1',
  '^@services/(.*)$': '<rootDir>/packages/shared/src/$1',
  '^@backend/(.*)$': '<rootDir>/packages/backend/src/$1',
  '^@renderer/(.*)$': '<rootDir>/packages/frontend/src/$1',
  '^@seeding/(.*)$': '<rootDir>/packages/seeding/src/$1',
  '\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/styleMock.ts',
  '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.ts'
}

const config: Config = {
  coverageProvider: 'v8',
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/electron/src/main/index.ts',
    '<rootDir>/packages/electron/src/preload/src/types.ts'
  ],
  collectCoverageFrom: [
    'packages/electron/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!packages/electron/src/main/index.ts',
    '!packages/electron/src/preload/src/types.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 0.8,
      branches: 0.7,
      functions: 0.8,
      lines: 0.8
    }
  },
  projects: [
    {
      displayName: 'main',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/packages/electron/src/main/**/*.test.ts',
        '<rootDir>/packages/electron/src/preload/**/*.test.ts'
      ],
      setupFiles: ['<rootDir>/test/setupEnv.ts'],
      moduleNameMapper: sharedModuleNameMapper,
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/packages/electron/tsconfig.node.json'
          }
        ]
      }
    }
  ]
}

export default config
