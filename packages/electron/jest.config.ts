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
  coverageProvider: 'v8',
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/electron/src/main/index.ts',
    '<rootDir>/packages/electron/src/preload/src/types.ts',
    '<rootDir>/packages/electron/src/renderer/src/main.tsx'
  ],
  collectCoverageFrom: [
    'packages/electron/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!packages/electron/src/main/index.ts',
    '!packages/electron/src/preload/src/types.ts',
    '!packages/electron/src/renderer/src/main.tsx'
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
    },
    {
      displayName: 'renderer',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/electron/src/renderer/**/*.test.ts?(x)'],
      setupFiles: ['<rootDir>/test/setupEnv.ts'],
      setupFilesAfterEnv: ['<rootDir>/test/setupRendererTests.ts'],
      moduleNameMapper: sharedModuleNameMapper,
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/packages/electron/tsconfig.web.json'
          }
        ]
      }
    }
  ]
}

export default config
